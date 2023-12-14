import type { FC } from 'react';
import { useRef } from 'react';
import { useState, useEffect } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import type { AccountTransactionRecordItem, Pagination } from './data';
import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';
import { Button, Result } from 'antd';

import styles from './style.less';
import { maxLength } from '@/global';
import TransactionDetails from '@/components/Member/AccountTransactionRecords';
import { fetchTransactionTypeByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import {
  fetchMemberAccountTransactionRecordExport,
  fetchMemberAccountTransactionRecords,
} from './service';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const AccountTransactionRecords: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const { initialState } = useModel('@@initialState');
  const filterRef = useRef<ProFormInstance>();

  const [statusEnums, setStatusEnums] = useState({});
  const [showDetail, setShowDetail] = useState(false);
  // const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<AccountTransactionRecordItem | null>();
  const [currentFileterValue, setCurrentFileterValue] = useState({});

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 20,
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
    link.download = `${t.formatMessage({ id: 'menu.Member' })}-${t.formatMessage({
      id: 'menu.Member.Account Transaction Records',
    })}_${username}.xlsx`;
    link.click();
  };

  const fetchDictionaryTransactionTyoe = async () => {
    const statusEnumValue = await fetchTransactionTypeByDictionaryCode(
      DICTIONARY_TYPE_CODE.Transaction_Types_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const handleFetchMemberAccountTransactionRecords = async (values: any, sort: any) => {
    const {
      createdAtRangedAt,
      pageSize: size,
      current: page,
      transactionType,
      orderId,
      merchantUsername,
      member,
    } = values;
    // const type = transactionTypes[transactionType];
    const filter: any = {
      size,
      page: page - 1,
      orderId,
      transactionType,
      merchantUsername,
      memberUsername: member,
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };
    if (createdAtRangedAt) {
      const [fromDate, toDate] = createdAtRangedAt;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }
    setCurrentFileterValue(filter);
    return fetchMemberAccountTransactionRecords(filter);
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
    const res = await fetchMemberAccountTransactionRecordExport(newfilterValueExcludeSizeAndPage);
    downloadFromBlob(res);
  };

  const columns: ProColumns<AccountTransactionRecordItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.merchant' })}</span>,
      dataIndex: 'merchantUsername',
      order: 2,
      // hideInSearch: true,
      // search: false,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.member' })}</span>,
      dataIndex: 'member',
      order: 1,
      // hideInSearch: true,
      // search: false,
      render: (_, value) => {
        return (
          (value.withdrawal && value.withdrawal.member && value.withdrawal.member.username) || '-'
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.orderID' })}</span>,
      dataIndex: 'orderId',
      order: 4,
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
      order: 3,
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
      order: 5,
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
      ellipsis: true,
      search: false,
      className: styles.remarks,
    },
  ];
  useEffect(() => {
    fetchDictionaryTransactionTyoe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  // useEffect(() => {
  //     const currMenuAccess = access?.Member.AccountTransactionRecords;
  //     const accountTransactionRecord = Object.keys(currMenuAccess).filter((key)=>{
  //     return currMenuAccess[key] === true;
  //     })
  //     setPageAccess(accountTransactionRecord.length > 0);
  // }, [])

  useEffect(() => {
    if (filterRef) {
      setFilters('member-account-records', filterRef);
    }
  }, [filterRef]);

  return (
    <Access
      // accessible={pageAccess}
      accessible={true}
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
        <ProTable<AccountTransactionRecordItem, Pagination>
          rowKey="key"
          cardBordered={true}
          pagination={paginationProps}
          request={handleFetchMemberAccountTransactionRecords}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['member-account-records'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['member-account-records'], { path: '/' })}
          formRef={filterRef}
          options={false}
          columns={columns}
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
