import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';

import { Access, useAccess, useIntl } from 'umi';

import { Button, message, Radio, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import { maxLength } from '@/global';

import type { MerchantReportItem } from '../../shared/merchant/data';
import styles from '../../shared/merchant/style.less';
import { fetchMerchantTransactionReports } from '../../shared/merchant/service';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
import * as XLSX from 'xlsx';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const MerchantMerchantReports: FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  const cookies = new Cookies();
  const actionRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();

  const [radioValue, setRadioValue] = useState('All');
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [reportData, setReportData] = useState<MerchantReportItem[]>([]);

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

  const columns: ProColumns<MerchantReportItem>[] = [
    {
      title: t.formatMessage({ id: 'table.merchant' }),
      dataIndex: 'merchantUsername',
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

  function onChangeMerchantMerchant(e: any) {
    const value = e.target.value;
    setRadioValue(value);
    actionRef?.current?.reload();
  }

  const handleFetchMerchantMerchantReports = async (values: any, sort: any) => {
    // const { createdAtRangetedAt, pageSize: size, current: page, merchantUsername } = values;
    const { createdAtRangetedAt, merchantUsername } = values;
    // console.log("values", values);
    // console.log("radio",radioValue);
    const filter: any = {
      // size,
      // page: page - 1,
      dateRange: radioValue,
      merchantUsername,
      sort: sort && sort.updatedTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRangetedAt) {
      const [fromDate, toDate] = createdAtRangetedAt;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const response = await fetchMerchantTransactionReports(filter);
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
        `${t.formatMessage({ id: 'table.merchant' })}`,
        `${t.formatMessage({ id: 'table.createdTime' })}`,
        `${t.formatMessage({ id: 'table.totalWithdrawalAmount' })}`,
        `${t.formatMessage({ id: 'table.totalWithdrawalNumber' })}`,
        `${t.formatMessage({ id: 'table.totalDepositAmount' })}`,
        `${t.formatMessage({ id: 'table.totalDepositNumber' })}`,
        `${t.formatMessage({ id: 'table.totalDepositFee' })}`,
      ],
    ];

    if (reportData.length > 0) {
      reportData.forEach((item: MerchantReportItem, index) => {
        if (index >= 9999) {
          return;
        }
        if (item.updatedTime === '总额' || item.updatedTime === 'Total') {
          aoa.push([
            ' ',
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
            item.merchantUsername,
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
        `${t.formatMessage({ id: 'menu.MerchantReports.Merchant' })}`,
      );
      XLSX.writeFile(
        wb,
        `${t.formatMessage({ id: 'menu.MerchantReports' })}-${t.formatMessage({
          id: 'menu.MerchantReports.Merchant',
        })}.xlsx`,
      );
      return;
    }
    message.error(t.formatMessage({ id: 'table.excel.emptyRow' }));
  };

  const onCheckRadioButtonValue = (e: any) => {
    if (e.target.defaultValue === radioValue) {
      setRadioValue('All');
      actionRef?.current?.reload();
    }
  };

  useEffect(() => {
    const currMenuAccess = access?.MerchantTRXReports.Merchant;
    const merchant = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(merchant.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('merchant-reports-merchant', filterRef);
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
        <ProTable<MerchantReportItem>
          className={styles.merchantReportTable}
          rowKey="key"
          cardBordered={true}
          actionRef={actionRef}
          pagination={defaultPaginationProps}
          request={handleFetchMerchantMerchantReports}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['merchant-reports-merchant'], v, { path: '/' })
          }
          onReset={() =>
            cookies.remove(filterCookieMap['merchant-reports-merchant'], { path: '/' })
          }
          search={
            access?.MerchantTRXReports.Merchant['View(Ownonly)'] ||
            access?.MerchantTRXReports.Merchant['View(forAll)']
          }
          columns={
            access?.MerchantTRXReports.Merchant['View(Ownonly)'] ||
            access?.MerchantTRXReports.Merchant['View(forAll)']
              ? columns
              : []
          }
          options={false}
          toolBarRender={() => [
            <Radio.Group
              onChange={onChangeMerchantMerchant}
              value={radioValue}
              key="radioButtonGroup"
            >
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
            <Access key="export" accessible={access?.MerchantTRXReports.Merchant.Export}>
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
export default MerchantMerchantReports;
