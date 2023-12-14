/* eslint-disable @typescript-eslint/consistent-type-imports */
import { FC, useRef, useState } from 'react';
import { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { AccountTransactionRecordItem, Pagination } from './data';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { fetchAccountTransactionRecordMerchantExport, fetchTransactionRecords } from './service';
import styles from './style.less';
import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';
import { Button, Result } from 'antd';
import { maxLength } from '@/global';
import TransactionDetails from '@/components/Merchant/AccountTransactionRecords/Details';
import { fetchTransactionTypeByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import { ProFormInstance } from '@ant-design/pro-form';

const AccountTransactionRecords: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const { initialState } = useModel('@@initialState');
  const filterRef = useRef<ProFormInstance>();
  const { currentUser } = initialState as any;

  const [statusEnums, setStatusEnums] = useState({});
  const [showDetail, setShowDetail] = useState(false);
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<AccountTransactionRecordItem | null>();
  const [currentFileterValue, setCurrentFileterValue] = useState({});

  const [paginationProps] = useState({
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 20,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  });

  const downloadFromBlob = (blob: Blob) => {
    const { username } = currentUser;
    const blobData = new Blob([blob], { type: '' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobData);
    link.download = `${t.formatMessage({ id: 'menu.Merchant' })}-${t.formatMessage({
      id: 'menu.Merchant.Account Transaction Records',
    })}_${username}.xlsx`;
    link.click();
  };

  const fetchDictionaryTransactionType = async () => {
    const statusEnumValue = await fetchTransactionTypeByDictionaryCode(
      DICTIONARY_TYPE_CODE.Transaction_Types_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const handleFetchTransactionRecords = async (values: any, sort: any) => {
    const {
      createdAtRangedAt,
      pageSize: size,
      current: page,
      transactionType,
      orderId,
      merchantUsername,
    } = values;
    // const type = transactionTypes[transactionType];
    const filter: any = {
      size,
      page: page - 1,
      orderId,
      transactionType,
      merchantUsername,
      userType: 'Merchant',
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };
    if (createdAtRangedAt) {
      const [fromDate, toDate] = createdAtRangedAt;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }
    setCurrentFileterValue(filter);
    return fetchTransactionRecords(filter);
  };

  const handleDownloadExcel = async () => {
    const language = selectedLang !== 'zh-CN' ? 'English' : 'Chinese';
    const filter = { ...currentFileterValue, language };
    const newfilterValueExcludeSizeAndPage = Object.keys(filter)
      .filter((key) => !key.includes('size') && !key.includes('page'))
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: filter[key],
        });
      }, {});

    const res = await fetchAccountTransactionRecordMerchantExport(newfilterValueExcludeSizeAndPage);
    downloadFromBlob(res);
  };

  const remarksDict = {
    withdrawalRemarksDontSplit: t.formatMessage({ id: 'trxn.withdrawalRemarksDontSplit' }),
    withdrawalRemarksElectronicReceipt: t.formatMessage({
      id: 'trxn.withdrawalRemarksElectronicReceipt',
    }),
    withdrawalRemarksMutiplePens: t.formatMessage({ id: 'trxn.withdrawalRemarksMutiplePens' }),
    withdrawalRemarks2Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks2Pens' }),
    withdrawalRemarks3Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks3Pens' }),
  };

  function setFlexToAuto(childNum: number, auto: boolean = true) {
    const timeField = document.querySelector<HTMLElement>(
      `[class*="AccountTransactionRecordsTable"] .ant-row.ant-row-start div:nth-child(${childNum}) .ant-col.ant-form-item-label`,
    );
    if (timeField) {
      if (auto) {
        timeField.style.setProperty('flex', '0 0 auto');
      } else {
        timeField.style.setProperty('flex', '0 0 80px');
      }
    }
  }

  const columns: ProColumns<AccountTransactionRecordItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.agent' })}</span>,
      dataIndex: ['agentUsername'],
      hideInSearch: true,
      search: false,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.merchant' })}</span>,
      dataIndex: 'merchantUsername',
      // hideInSearch: true,
      // search: false,
    },
    // {
    //   title: <span>{t.formatMessage({ id: 'table.member' })}</span>,
    //   dataIndex: 'member',
    //   hideInSearch: true,
    //   search: false,
    //   render: (_, value) => {
    //     return (
    //       (value.withdrawal && value.withdrawal.member && value.withdrawal.member.username) || '-'
    //     );
    //   },
    // },
    {
      title: <span>{t.formatMessage({ id: 'table.orderID' })}</span>,
      dataIndex: 'orderId',
      order: 2,
      render: (dom, entity: AccountTransactionRecordItem) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
      fieldProps: {
        maxLength: maxLength.VALUE,
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.transactionType' })}</span>,
      dataIndex: 'transactionType',
      order: 1,
      initialValue: 'All',
      valueEnum: statusEnums,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.before' })}</span>,
      dataIndex: 'beforeTrans',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.change' })}</span>,
      dataIndex: 'changeTrans',
      hideInSearch: true,
      render: (dom) => {
        if (dom && dom < 0) {
          return <p style={{ color: '#F5222D', margin: '0' }}>{Math.abs(+dom)}</p>;
        }
        return <p style={{ color: '#389E0D', margin: '0' }}>{dom}</p>;
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.after' })}</span>,
      dataIndex: 'afterTrans',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.createdTime' })}</span>,
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.time' })}</span>,
      dataIndex: 'createdAtRangedAt',
      valueType: 'dateTimeRange',
      hideInTable: true,
      order: 3,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.remarks' })}</span>,
      dataIndex: 'remark',
      search: false,
      className: styles.remarks,
      render: (v: any) => {
        return (
          v &&
          v.split(',').map((text: string) => {
            return (
              <p key={text} style={{ marginBottom: '0' }}>
                {remarksDict[text] || text}
              </p>
            );
          })
        );
      },
    },
  ];

  console.log(access?.Merchants.AccountTransactionRecords);

  const hideAgentColumn = !access?.Merchants.AccountTransactionRecords.ShowAgentinfo;

  if (hideAgentColumn) columns.shift();

  useEffect(() => {
    setFlexToAuto(1);
  }, []);

  useEffect(() => {
    fetchDictionaryTransactionType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    const currMenuAccess = access?.Merchants.AccountTransactionRecords;
    const accountTransactionRecord = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(accountTransactionRecord.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('merchant-account-records', filterRef);
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
        <ProTable<AccountTransactionRecordItem, Pagination>
          className={styles.AccountTransactionRecordsTable}
          rowKey="key"
          cardBordered={true}
          pagination={paginationProps}
          request={handleFetchTransactionRecords}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['merchant-account-records'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['merchant-account-records'], { path: '/' })}
          columns={columns}
          options={false}
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Access key="export" accessible={access?.Merchants.AccountTransactionRecords.Export}>
              <Button key="export" type="primary" onClick={handleDownloadExcel}>
                {t.formatMessage({ id: 'table.export' })}
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
      <TransactionDetails
        visible={showDetail}
        currentRow={currentRow}
        close={() => setShowDetail(false)}
      />
    </Access>
  );
};

export default AccountTransactionRecords;
