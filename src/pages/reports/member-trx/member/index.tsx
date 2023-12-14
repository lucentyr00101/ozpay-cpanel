import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';

import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';

import { Result, Radio, Button } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import type { MemberReportItem } from '../../shared/member/data';
import { fetchMemberReports, fetchMemberTRXMemberExportReports } from '../../shared/member/service';

import { maxLength } from '@/global';
import styles from '../../shared/member/style.less';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
// import * as XLSX from 'xlsx';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const MemberMemberReports: FC = () => {
  const t = useIntl();
  const cookies = new Cookies();
  const access: any = useAccess();
  const actionRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const selectedLang = getLocale();
  const { initialState } = useModel('@@initialState');
  
  const [radioValue, setRadioValue] = useState('All');
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  // const [reportData, setReportData] = useState<MemberReportItem[]>([]);
  const [currentFileterValue, setCurrentFileterValue] = useState({ page: 0, size: 20 });

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
      id: 'menu.MemberReports.Member',
    })}_${username}.xlsx`;
    link.click();
  };

  const columns: ProColumns<MemberReportItem>[] = [
    {
      title: t.formatMessage({ id: 'table.merchant' }),
      dataIndex: 'merchantUsername',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.member' }),
      dataIndex: 'memberUsername',
      order: 1,
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
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
      order: 2,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
  ];

  function onChangeMemberMember(e: any) {
    const value = e.target.value;
    setRadioValue(value);
    actionRef?.current?.reload();
  }

  const handleDownloadExcel = async () => {
    const language = selectedLang !== 'zh-CN' ? 'English' : 'Chinese';
    const filter = { ...currentFileterValue, language };

    const res = await fetchMemberTRXMemberExportReports(filter);
    downloadFromBlob(res);
  };

  const handleFetchMemberMemberReports = async (values: any, sort: any) => {
    // const { createdAtRangetedAt, pageSize: size, current: page, memberUsername } = values;
    const { createdAtRangetedAt, memberUsername } = values;
    // console.log("values", values);
    // console.log("radio",radioValue);
    const filter: any = {
      // size,
      // page: page - 1,
      dateRange: radioValue,
      memberUsername,
      sort: sort && sort.updatedTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRangetedAt) {
      const [fromDate, toDate] = createdAtRangetedAt;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }
    setCurrentFileterValue(filter);
    const response = await fetchMemberReports(filter);
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
          merchantUsername: ' ',
          memberUsername: ' ',
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
    const currMenuAccess = access?.MemberTRXReports.Member;
    const memberReport = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(memberReport.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('member-reports-member', filterRef);
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
        <ProTable<MemberReportItem>
          className={styles.memberReportTable}
          rowKey="key"
          cardBordered={true}
          actionRef={actionRef}
          pagination={defaultPaginationProps}
          request={handleFetchMemberMemberReports}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['member-reports-member'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['member-reports-member'], { path: '/' })}
          search={
            access?.MemberTRXReports.Member['View(Ownonly)'] ||
            access?.MemberTRXReports.Member['View(forAll)']
          }
          columns={
            access?.MemberTRXReports.Member['View(Ownonly)'] ||
            access?.MemberTRXReports.Member['View(forAll)']
              ? columns
              : []
          }
          options={false}
          toolBarRender={() => [
            <Radio.Group onChange={onChangeMemberMember} value={radioValue} key="radioButtonGroup">
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
            <Access key="add" accessible={access?.MemberTRXReports.Member.Export}>
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

export default MemberMemberReports;
