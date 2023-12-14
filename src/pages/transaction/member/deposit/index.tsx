/* eslint-disable react-hooks/exhaustive-deps */
import type { FC } from 'react';
import { useRef } from 'react';
import { useState, useEffect } from 'react';

import { Access, getLocale, useAccess, useIntl } from 'umi';

import { Badge, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormDigitRange } from '@ant-design/pro-form';

import styles from '../../shared/deposit/style.less';
import { getDepositList } from '../../shared/deposit/service';
import type { DepositItem, Pagination } from '../../shared/deposit/data.d';

import { maxLength } from '@/global';
import { getPaymentTypeList } from '@/pages/transaction/shared/fiat-payment-type/service';

import DepositDetails from '@/components/Transactions/Deposit/Details';
import {
  fetchAutoRefreshRateByDictionaryCode,
  fetchStatusByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import Cookies from 'universal-cookie';
import { refRateCookieMap, filterCookieMap, setFilters } from '@/global';

const MemberDesposit: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();

  const [statusEnums, setStatusEnums] = useState({});
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [autoRefreshRateEnums, setAutoRefreshRateEnums] = useState([]);
  const [currentRow, setCurrentRow] = useState<DepositItem>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [activeKeyTable, setActiveKeyTable] = useState<React.Key>(5);
  const [refreshInterval, setRefreshInterval] = useState<any>();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();

  const handleAutoRefresh = (key: any) => {
    const _key = key.match(/(\d+)/)?.[0];
    cookies.set(refRateCookieMap['member-deposit'], key, { path: '/' });
    if (_key) {
      const seconds = +_key * 1000;
      clearInterval(refreshInterval as any);
      setRefreshInterval(undefined);
      const interval = setInterval(() => tableRef?.current?.reload?.(), seconds);
      setRefreshInterval(interval);
    } else {
      clearInterval(refreshInterval as any);
      setRefreshInterval(undefined);
    }
  };

  const setInitialRefreshRate = (data: { key: string; label: string }) => {
    const refRateCookie = cookies.get(refRateCookieMap['member-deposit']);
    if (refRateCookie) {
      handleAutoRefresh(refRateCookie);
      setActiveKeyTable(refRateCookie);
      return;
    }

    const { key } = data;
    if (key && key.toLowerCase() !== 'off') handleAutoRefresh(key);
  };

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

  const fetchDictionaryDepositStatus = async () => {
    const statusEnumValue = await fetchStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Deposit_Status_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const fetchDictionaryAutoRefreshRate = async () => {
    const autoRefreshEnums = await fetchAutoRefreshRateByDictionaryCode(
      DICTIONARY_TYPE_CODE.Auto_Refresh_Rate_Code,
      selectedLang,
    );
    setInitialRefreshRate(autoRefreshEnums[0]);
    setAutoRefreshRateEnums(autoRefreshEnums);
  };

  function setFlexToAuto(childNum: number, auto: boolean = true) {
    const timeField = document.querySelector<HTMLElement>(
      `[class*="depositTable"] .ant-row.ant-row-start div:nth-child(${childNum}) .ant-col.ant-form-item-label`,
    );
    if (timeField) {
      if (auto) {
        timeField.style.setProperty('flex', '0 0 auto');
      } else {
        timeField.style.setProperty('flex', '0 0 80px');
      }
    }
  }

  const fetchDepositList = async (values: any, sort: any) => {
    const {
      member,
      merchant,
      paymentType,
      status,
      withdrawal,
      createdAtRange,
      pageSize: size,
      current: page,
    } = values;
    const filter: any = {
      size,
      ...((member?.username && { memberUsername: member?.username }) || {}),
      ...((merchant?.username && { merchantUsername: merchant?.username }) || {}),
      ...(paymentType && { paymentTypeTag: paymentType }),
      orderId: withdrawal?.orderId,
      status: status || undefined,
      minAmount: withdrawal?.amount?.[0].toFixed(2),
      maxAmount: withdrawal?.amount?.[1].toFixed(2),
      page: page - 1,
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const data = await getDepositList(filter);

    return data;
  };

  const fetchPaymentList = async () => {
    const res = await getPaymentTypeList('Member');
    const data = res.data.map((_data) => {
      return {
        label: _data.name,
        value: _data.tag,
      };
    });
    return Promise.resolve([
      {
        label: t.formatMessage({ id: 'component.tagSelect.all' }),
        value: '',
      },
      ...data,
    ]);
  };

  const columns: ProColumns<DepositItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.merchant' })}</span>,
      dataIndex: ['merchant', 'username'],
      order: 4,
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.member' })}</span>,
      dataIndex: ['member', 'username'],
      order: 3,
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.orderID' })}</span>,
      dataIndex: ['withdrawal', 'orderId'],
      order: 6,
      render: (dom, entity) => {
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
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentType' })}</span>,
      dataIndex: ['paymentType', 'name'],
      hideInSearch: true,
      render: (value, entity: any) => {
        const { withdrawal } = entity;
        const { cryptoAddress, cryptoPayment } = withdrawal;
        const isCrypto = !!cryptoAddress && !!cryptoPayment;

        if (isCrypto) {
          return cryptoPayment;
        }

        return entity && entity.paymentType?.name;
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentInfo' })}</span>,
      dataIndex: 'paymentInfo',
      hideInSearch: true,
      ellipsis: true,
      width: 230,
      render: (value, entity: any) => {
        const { withdrawal } = entity;
        const { cryptoAddress, cryptoPayment, exchangeRate } = withdrawal;
        const isCrypto = !!cryptoAddress && !!cryptoPayment && exchangeRate;

        if (isCrypto) {
          const cryptoAmount = entity.withdrawal.amount * entity.withdrawal.exchangeRate;
          return (
            <div className={styles.paymentInfo}>
              <p style={{ marginBottom: '0' }}>{entity.withdrawal.cryptoPayment}</p>
              <p style={{ marginBottom: '0' }}>{entity.withdrawal.cryptoAddress}</p>
              <p style={{ marginBottom: '0' }}>{`${t.formatMessage({ id: 'trxn.usdtAmount' })}: ${
                cryptoAmount || ''
              }`}</p>
              <p style={{ marginBottom: '0' }}>{`${t.formatMessage({ id: 'trxn.exchangeRate' })}: ${
                entity.withdrawal.exchangeRate || ''
              }`}</p>
            </div>
          );
        }
        return (
          <div className={styles.paymentInfo}>
            <p style={{ marginBottom: '0' }}>{entity.withdrawal.paymentTypeTag}</p>
            <p style={{ marginBottom: '0' }}>
              {entity.withdrawal.bankName} - {entity.withdrawal.accountName}
            </p>
            <p style={{ marginBottom: '0' }}>{entity.withdrawal.accountNo}</p>
          </div>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentType' })}</span>,
      dataIndex: 'paymentType',
      hideInTable: true,
      initialValue: '',
      order: 2,
      request: async () => await fetchPaymentList(),
    },
    {
      title: <span>{t.formatMessage({ id: 'table.amount' })}</span>,
      dataIndex: ['withdrawal', 'amount'],
      hideInTable: true,
      valueType: 'digitRange',
      fieldProps: {
        maxLength: maxLength.AMOUNT,
        placeholder: ['', ''],
      },
      renderFormItem: () => {
        return (
          <ProFormDigitRange
            separator={t.formatMessage({ id: 'table.To' })}
            separatorWidth={35}
            placeholder={[
              t.formatMessage({ id: 'modal.min' }),
              t.formatMessage({ id: 'modal.max' }),
            ]}
            fieldProps={{
              min: 1,
              maxLength: 15,
            }}
            formItemProps={{
              className: 'custom-range',
            }}
          />
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.amount' })}</span>,
      dataIndex: ['withdrawal', 'amount'],
      hideInSearch: true,
      render: (v: any) => v.toFixed(2),
      fieldProps: {
        placeholder: ['', ''],
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.fee' })}</span>,
      dataIndex: 'fee',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.createdTime' })}</span>,
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.time' })}</span>,
      dataIndex: 'createdAtRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      order: 7,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.status' })}</span>,
      dataIndex: 'status',
      initialValue: 'All',
      order: 5,
      valueEnum: statusEnums,
      render: (data: any, value) => {
        if (Object.keys(data.props.valueEnum).length > 0) {
          const currentItem = data.props.valueEnum[value.status];
          if (currentItem !== undefined) {
            return (
              <Badge
                color={currentItem.color}
                text={currentItem.text}
                style={{ fontWeight: 600 }}
              />
            );
          }
        }
        return value;
      },
    },
  ];

  useEffect(() => {
    fetchDictionaryDepositStatus();
  }, [selectedLang]);

  useEffect(() => {
    fetchDictionaryAutoRefreshRate();
  }, [selectedLang]);

  useEffect(() => {
    setFlexToAuto(1);
  }, []);

  useEffect(() => {
    const currMenuAccess = access?.MemberTransaction.Deposit;
    const desposit = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(desposit.length > 0);
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('member-deposit', filterRef);
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
        <ProTable<DepositItem, Pagination>
          className={styles.depositTable}
          actionRef={tableRef}
          formRef={filterRef}
          onSubmit={(v: any) => cookies.set(filterCookieMap['member-deposit'], v, { path: '/' })}
          onReset={() => cookies.remove(filterCookieMap['member-deposit'], { path: '/' })}
          rowKey="key"
          cardBordered={true}
          pagination={paginationProps}
          search={
            access?.MemberTransaction.Deposit['View(Ownonly)'] ||
            access?.MemberTransaction.Deposit['View(forAll)']
          }
          columns={
            access?.MemberTransaction.Deposit['View(Ownonly)'] ||
            access?.MemberTransaction.Deposit['View(forAll)']
              ? columns
              : []
          }
          options={false}
          request={fetchDepositList}
          headerTitle={t.formatMessage({ id: 'table.headerTitle.autoRefesh' })}
          toolbar={{
            menu: {
              type: 'dropdown',
              activeKey: activeKeyTable,
              items: autoRefreshRateEnums.map((val: any) => {
                return { ...val, label: <a onClick={(e) => e.preventDefault()}>{val.label}</a> };
              }),
              onChange: (key) => {
                handleAutoRefresh(key);
                setActiveKeyTable(key as string);
              },
            },
          }}
          // search={{
          //   labelWidth: 'auto',
          // }}
        />
        <DepositDetails
          currentRow={currentRow}
          visible={showDetail}
          close={() => setShowDetail(false)}
        />
      </PageContainer>
    </Access>
  );
};

export default MemberDesposit;
