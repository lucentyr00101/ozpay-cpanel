import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';

import { Access, useAccess, useIntl } from 'umi';

import { Button, message, Radio, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import type { DailyReportItem } from '../../shared/daily/data';
import { fetchMerchantDailyReports } from '../../shared/daily/service';
import styles from '../../shared/daily/style.less';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
import * as XLSX from 'xlsx';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const MerchantDailyReports: FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  const cookies = new Cookies();
  const actionRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();

  const [radioValue, setRadioValue] = useState('All');
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [reportData, setReportData] = useState<DailyReportItem[]>([]);

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

  function onChangeMerchantDaily(e: any) {
    const value = e.target.value;
    setRadioValue(value);
    actionRef?.current?.reload();
  }

  const handleFetchMerchantDailyReports = async (values: any, sort: any) => {
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

    const response = await fetchMerchantDailyReports(filter);
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
      setReportData(response.data);
      return response;
    }

    return null;
  };

  const downloadExcel = () => {
    const aoa = [
      [
        `${t.formatMessage({ id: 'table.No.ID' })}`,
        `${t.formatMessage({ id: 'table.createdTime' })}`,
        `${t.formatMessage({ id: 'table.totalWithdrawalAmount' })}`,
        `${t.formatMessage({ id: 'table.totalWithdrawalNumber' })}`,
        `${t.formatMessage({ id: 'table.totalDepositAmount' })}`,
        `${t.formatMessage({ id: 'table.totalDepositNumber' })}`,
        `${t.formatMessage({ id: 'table.totalDepositFee' })}`,
      ],
    ];

    if (reportData.length > 0) {
      reportData.forEach((item: DailyReportItem, index) => {
        if (index >= 9999) {
          return;
        }
        if (item.updatedTime === '总额' || item.updatedTime === 'Total') {
          aoa.push([
            ' ',
            item.updatedTime,
            item.totalWithdrawalAmount.toString(),
            item.totalWithdrawalNumber.toString(),
            item.totalDepositAmount.toString(),
            item.totalDepositNumber.toString(),
            item.totalDepositFee.toString(),
          ]);
        } else {
          aoa.push([
            (index + 1).toString(),
            item.updatedTime,
            item.totalWithdrawalAmount.toString(),
            item.totalWithdrawalNumber.toString(),
            item.totalDepositAmount.toString(),
            item.totalDepositNumber.toString(),
            item.totalDepositFee.toString(),
          ]);
        }
      });
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        `${t.formatMessage({ id: 'menu.MerchantReports.Daily' })}`,
      );
      XLSX.writeFile(
        wb,
        `${t.formatMessage({ id: 'menu.MerchantReports' })}-${t.formatMessage({
          id: 'menu.MerchantReports.Daily',
        })}.xlsx`,
      );
      return;
    }
    message.error(t.formatMessage({ id: 'table.excel.emptyRow' }));
  };

  useEffect(() => {
    const currMenuAccess = access?.MerchantTRXReports.Daily;
    const merchantDaily = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(merchantDaily.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('merchant-reports-daily', filterRef);
    }
  }, [filterRef]);

  const onCheckRadioButtonValue = (e: any) => {
    if (e.target.defaultValue === radioValue) {
      setRadioValue('All');
      actionRef?.current?.reload();
    }
  };

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
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['merchant-reports-daily'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['merchant-reports-daily'], { path: '/' })}
          request={handleFetchMerchantDailyReports}
          search={
            access?.MerchantTRXReports.Daily['View(Ownonly)'] ||
            access?.MerchantTRXReports.Daily['View(forAll)']
          }
          columns={
            access?.MerchantTRXReports.Daily['View(Ownonly)'] ||
            access?.MerchantTRXReports.Daily['View(forAll)']
              ? columns
              : []
          }
          options={false}
          toolBarRender={() => [
            <Radio.Group onChange={onChangeMerchantDaily} value={radioValue} key="radioButtonGroup">
              <Radio.Button value="Today" onClick={onCheckRadioButtonValue}>
                {t.formatMessage({ id: 'table.today' })}
              </Radio.Button>
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
            <Access key="export" accessible={access?.MerchantTRXReports.Daily.Export}>
              <Button
                type="primary"
                key="btnExport"
                className={styles.btnExport}
                onClick={downloadExcel}
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
export default MerchantDailyReports;
