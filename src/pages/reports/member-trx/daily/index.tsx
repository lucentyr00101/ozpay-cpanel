import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';

import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';

import { Result, Radio, Button } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import type { DailyReportItem } from '../../shared/daily/data';
import { fetchDailyExportReports, fetchDailyReports } from '../../shared/daily/service';

import styles from '../../shared/daily/style.less';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
// import * as XLSX from 'xlsx';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const MemberDailyReports: FC = () => {
  const t = useIntl();
  const cookies = new Cookies();
  const selectedLang = getLocale();
  const access: any = useAccess();
  const actionRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  
  const [radioValue, setRadioValue] = useState('All');
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentFileterValue, setCurrentFileterValue] = useState({ page: 0, size: 20 });
  // const [reportData, setReportData] = useState<DailyReportItem[]>([]);

  const defaultPaginationProps = {
    showSizeChanger: false,
    showQuickJumper: false,
    pageSize: 0,
    total: 0,
    hideOnSinglePage: true,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  const downloadFromBlob = (blob: Blob) => {
    const { currentUser } = initialState as any;
    const { username } = currentUser;
    const blobData = new Blob([blob], { type: '' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobData);
    link.download = `${t.formatMessage({ id: 'menu.MemberReports' })}-${t.formatMessage({
      id: 'menu.MemberReports.Daily',
    })}_${username}.xlsx`;
    link.click();
  };

  const handleDownloadExcel = async () => {
    const language = selectedLang !== 'zh-CN' ? 'English' : 'Chinese';
    const filter = { ...currentFileterValue, language };

    const res = await fetchDailyExportReports(filter);
    downloadFromBlob(res);
  };

  const columns: ProColumns<DailyReportItem>[] = [
    {
      title: t.formatMessage({ id: 'table.finishedTime' }),
      dataIndex: 'updatedTime',
      hideInSearch: true,
      width: 200,
      sorter: true,
    },
    {
      title: t.formatMessage({ id: 'table.totalWithdrawalAmount' }),
      dataIndex: 'totalWithdrawalAmount',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.totalWithdrawalNumber' }),
      dataIndex: 'totalWithdrawalNumber',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.totalDepositAmount' }),
      dataIndex: 'totalDepositAmount',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.totalDepositNumber' }),
      dataIndex: 'totalDepositNumber',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.totalDepositFee' }),
      dataIndex: 'totalDepositFee',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.time' }),
      dataIndex: 'createdAtRangetedAt',
      valueType: 'dateTimeRange',
      hideInTable: true,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
  ];

  function onChangeMemberDaily(e: any) {
    const value = e.target.value;
    setRadioValue(value);
    actionRef?.current?.reload();
  }

  const handleFetchMemberDailyReports = async (values: any, sort: any) => {
    // const { createdAtRangetedAt, pageSize: size, current: page } = values;
    const { createdAtRangetedAt } = values;
    const filter: any = {
      // size,
      // page: page - 1,
      dateRange: radioValue,
      sort: sort && sort.updatedTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRangetedAt) {
      const [fromDate, toDate] = createdAtRangetedAt;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }
    setCurrentFileterValue(filter);
    const response = await fetchDailyReports(filter);

    if (response.data.length > 0) {
      // count total
      let totalTotalWithdrawalAmount = 0,
        totalTotalWithdrawalNumber = 0,
        totalTotalDepositAmount = 0,
        totalTotalDepositNumber = 0,
        totalTotalDepositFee = 0;

      response.data.forEach((item) => {
        totalTotalWithdrawalAmount = totalTotalWithdrawalAmount + item.totalWithdrawalAmount;
        totalTotalWithdrawalNumber = totalTotalWithdrawalNumber + item.totalWithdrawalNumber;
        totalTotalDepositAmount = totalTotalDepositAmount + item.totalDepositAmount;
        totalTotalDepositNumber = totalTotalDepositNumber + item.totalDepositNumber;
        totalTotalDepositFee = totalTotalDepositFee + item.totalDepositFee;
      });

      const responseData = [
        ...response.data,
        {
          key: 0,
          updatedTime: `${t.formatMessage({ id: 'table.total' })}`,
          totalDepositAmount: totalTotalDepositAmount.toFixed(2),
          totalDepositFee: totalTotalDepositFee.toFixed(2),
          totalDepositNumber: totalTotalDepositNumber.toFixed(2),
          totalWithdrawalAmount: totalTotalWithdrawalAmount.toFixed(2),
          totalWithdrawalNumber: totalTotalWithdrawalNumber.toFixed(2),
        },
      ];
      response.data = responseData;
      // setReportData(response.data);
      return response;
    }

    return null;
  };

  const onCheckRadioButtonValue = (e: any)=> {
    if(e.target.defaultValue === radioValue){
      setRadioValue('All');
      actionRef?.current?.reload();
    }
  };

  useEffect(() => {
    const currMenuAccess = access?.MemberTRXReports.Daily;
    const daily = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(daily.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('member-reports-daily', filterRef);
    }
  }, [filterRef]);

  return (
    <Access
      accessible={pageAccess}
      fallback={
        <Result
          status="404"
          style={{
            height: '100%',
            background: '#fff',
          }}
          title={t.formatMessage({ id: 'messages.sorry' })}
          subTitle={t.formatMessage({ id: 'messages.notAuthorizedAccess' })}
        />
      }
    >
      <PageContainer title={false}>
        <NotificationMsgBox />
        <ProTable<DailyReportItem>
          className={styles.dailyReportTable}
          rowKey="key"
          cardBordered={true}
          actionRef={actionRef}
          pagination={defaultPaginationProps}
          request={handleFetchMemberDailyReports}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['member-reports-daily'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['member-reports-daily'], { path: '/' })}
          search={
            access?.MemberTRXReports.Daily['View(Ownonly)'] ||
            access?.MemberTRXReports.Daily['View(forAll)']
          }
          columns={
            access?.MemberTRXReports.Daily['View(Ownonly)'] ||
            access?.MemberTRXReports.Daily['View(forAll)']
              ? columns
              : []
          }
          options={false}
          toolBarRender={() => [
            <Radio.Group onChange={onChangeMemberDaily} value={radioValue} key="radioButtonGroup">
              <Radio.Button value="Today" onClick={onCheckRadioButtonValue}>{t.formatMessage({ id: 'table.today' })}</Radio.Button>
              <Radio.Button value="Yesterday" onClick={onCheckRadioButtonValue}>
                {t.formatMessage({ id: 'table.yesterday' })}
              </Radio.Button>
              <Radio.Button value="This Week" onClick={onCheckRadioButtonValue}>
                {t.formatMessage({ id: 'table.thisWeek' })}
              </Radio.Button>
              <Radio.Button value="Last Week" onClick={onCheckRadioButtonValue}>
                {t.formatMessage({ id: 'table.lastWeek' })}
              </Radio.Button>
              <Radio.Button value="This Month" onClick={onCheckRadioButtonValue}>
                {t.formatMessage({ id: 'table.thisMonth' })}
              </Radio.Button>
              <Radio.Button value="Last Month" onClick={onCheckRadioButtonValue}>
                {t.formatMessage({ id: 'table.lastMonth' })}
              </Radio.Button>
            </Radio.Group>,
            <Access key="add" accessible={access?.MemberTRXReports.Daily.Export}>
              <Button
                type="primary"
                key="btnExport"
                className={styles.btnExport}
                onClick={handleDownloadExcel}
              >
                {t.formatMessage({ id: 'table.export' })}
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
    </Access>
  );
};

export default MemberDailyReports;
