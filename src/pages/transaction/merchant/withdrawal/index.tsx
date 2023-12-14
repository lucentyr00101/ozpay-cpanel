import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Access, getLocale, useAccess, useIntl, useModel, useHistory } from 'umi';

import { Badge, Button, message, Result, Typography } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormDigitRange } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import CountDown from '@/components/Countdown';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
import FiatDepositRequest from '@/components/Transactions/Withdrawal/DepositRequest/FiatDepositRequest';
import CryptoDepositRequest from '@/components/Transactions/Withdrawal/DepositRequest/CryptoDepositRequest';
import SummaryCounter from '@/components/Transactions/Withdrawal/Summary';

import {
  getMerchantsWithdrawalExport,
  getMerchantsWithdrawalList,
  updateStatus,
} from '../../shared/withdrawal/service';
import type { MerchantWithdrawalItem, Pagination } from '../../shared/withdrawal/data';
import styles from '../../shared/withdrawal/style.less';

import {
  fetchAutoRefreshRateByDictionaryCode,
  fetchStatusByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';

import { maxLength } from '@/global';
// import * as XLSX from 'xlsx';
import Cookies from 'universal-cookie';
import { refRateCookieMap, filterCookieMap, setFilters } from '@/global';

const MerchantWithdrawal: FC = () => {
  const cookies = new Cookies();
  const history = useHistory();
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { Paragraph, Link } = Typography;
  const { initialState } = useModel('@@initialState');

  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentFileterValue, setCurrentFileterValue] = useState({
    page: 0,
    size: 20,
    sort: 'Desc',
    status: 'All',
  });
  const [statusEnums, setStatusEnums] = useState({});
  const [autoRefreshRateEnums, setAutoRefreshRateEnums] = useState([]);
  const [currentRow, setCurrentRow] = useState<MerchantWithdrawalItem>();
  const [activeKeyTable, setActiveKeyTable] = useState<React.Key>(5);
  const [fiatDepositRequest, setFiatDepositRequest] = useState<boolean>(false);
  const [cryptoDepositRequest, setCryptoDepositRequest] = useState<boolean>(false);
  const [historyQueryId, setHistoryQueryId] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<any>();
  const [selectedRefreshRate, setSelectedRefreshRate] = useState('');
  const [tableFilters, setTableFilters] = useState<any>(filterRef?.current?.getFieldsValue(true));

  // const filterRefValues = filterRef?.current?.getFieldsValue(true);

  const handleAutoRefresh = (key: any) => {
    // extracts numbers from a string
    const _key = key.match(/(\d+)/)?.[0];
    cookies.set(refRateCookieMap['merchant-withdrawal'], key, { path: '/' });
    setSelectedRefreshRate(_key);
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
    const refRateCookie = cookies.get(refRateCookieMap['merchant-withdrawal']);
    if (refRateCookie) {
      handleAutoRefresh(refRateCookie);
      setActiveKeyTable(refRateCookie);
      return;
    }

    const { key } = data;
    if (key && key.toLowerCase() !== 'off') handleAutoRefresh(key);
  };

  const downloadFromBlob = (blob: Blob) => {
    const { currentUser } = initialState as any;
    const { username } = currentUser;
    const blobData = new Blob([blob], { type: '' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobData);
    link.download = `${t.formatMessage({
      id: 'menu.MerchantTransaction',
    })}-${t.formatMessage({ id: 'menu.MerchantTransaction.Withdrawal' })}_${username}.xlsx`;
    link.click();
  };

  const fetchDictionaryWithdrawalStatus = async () => {
    const statusEnumValue = await fetchStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Withdrawal_Status_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
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
    const res = await getMerchantsWithdrawalExport(newfilterValueExcludeSizeAndPage);
    downloadFromBlob(res);
  };

  const fetchDictionaryAutoRefreshRate = async () => {
    const autoRefreshEnums = await fetchAutoRefreshRateByDictionaryCode(
      DICTIONARY_TYPE_CODE.Auto_Refresh_Rate_Code,
      selectedLang,
    );
    setInitialRefreshRate(autoRefreshEnums[0]);
    const refRateCookie = cookies.get(refRateCookieMap['merchant-withdrawal']);
    const _key = !!refRateCookie
      ? refRateCookie.match(/(\d+)/)?.[0]
      : autoRefreshEnums[0].key.match(/(\d+)/)?.[0];
    setSelectedRefreshRate(_key);
    setAutoRefreshRateEnums(autoRefreshEnums);
  };

  const fetchTableData = async (values: any, sort: any) => {
    const {
      createdAtRange,
      pageSize: size,
      current: page,
      orderId,
      status,
      member,
      merchant,
      paymentTypeTag,
      amountInSearch,
      remark,
    } = values;
    // console.log({ values, sort });
    const filter: any = {
      size,
      page: page - 1,
      ...(orderId && { orderId }),
      ...(status && { status }),
      ...(remark && { remark }),
      // ...(memberUsername && { memberUsername }),
      ...(paymentTypeTag && { paymentTypeTag }),
      language: selectedLang !== 'zh-CN' ? 'English' : 'Chinese',
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (member) {
      const { merchantUsername, username } = member;
      if (merchantUsername) {
        filter.merchantUsername = merchantUsername;
      }
      if (username) {
        filter.memberUsername = username;
      }
    }

    if (amountInSearch?.length) {
      const [minAmount, maxAmount] = amountInSearch;
      filter.minAmount = minAmount.toFixed(2);
      filter.maxAmount = maxAmount.toFixed(2);
    }

    console.log({ createdAtRange });

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    if (merchant) {
      const { username } = merchant.sysUser;
      if (username) {
        filter.merchantUsername = username;
      }
    }

    setCurrentFileterValue(filter);
    const data = await getMerchantsWithdrawalList(filter);

    return data;
  };

  const toggleStatusWithdrawal = async (id: string, status: string, remark: string) => {
    try {
      await updateStatus({
        id,
        status,
        remark,
      });
      message.success(t.formatMessage({ id: 'messages.cancelWithdraw' }));
      tableRef?.current?.reloadAndRest?.();
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong');
    }
  };

  const confirmToggleStatus = async ({ id, status, updateStatus: _updateStatus, remark }: any) => {
    if (['Waiting', 'Under Review'].includes(status)) {
      await toggleStatusWithdrawal(id, _updateStatus, remark);
    }
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

  const removeQuery = () => {
    const id = history?.location?.query?.id;
    if (id) {
      console.log('remove query id');
      const pathname = history?.location?.pathname;
      history.push(pathname);
      setTimeout(() => {
        filterRef?.current?.resetFields();
        filterRef?.current?.submit();
      }, 500);
    }
  };

  const columns: ProColumns<MerchantWithdrawalItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.username' })}</span>,
      dataIndex: ['merchant', 'sysUser', 'username'],
      order: 1,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.orderID' })}</span>,
      dataIndex: 'orderId',
      initialValue: history?.location?.query?.id,
      order: 4,
      render: (dom, entity: any) => {
        if (historyQueryId && entity.paymentType?.groupType === 'Crypto') {
          setCurrentRow(entity);
          setCryptoDepositRequest(true);
        } else if (historyQueryId && entity.paymentType?.groupType === 'Fiat') {
          setCurrentRow(entity);
          setFiatDepositRequest(true);
        }
        if (entity.paymentType?.groupType === 'Crypto') {
          return (
            <Link
              href="#"
              onClick={() => {
                setCurrentRow(entity);
                setCryptoDepositRequest(true);
              }}
            >
              {dom}
            </Link>
          );
        }

        return (
          <Link
            href="#"
            onClick={() => {
              setCurrentRow(entity);
              setFiatDepositRequest(true);
            }}
          >
            {dom}
          </Link>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentType' })}</span>,
      dataIndex: ['paymentType', 'groupType'],
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentInfo' })}</span>,
      dataIndex: 'paymentInfo',
      hideInSearch: true,
      width: 230,
      render: (value: any, entity: any) => {
        const paymentType = entity.paymentType;
        let isCrypto;
        if (paymentType) {
          isCrypto = paymentType.groupType === 'Crypto';
        }
        if (isCrypto) {
          return (
            <>
              <Paragraph copyable={{ text: entity.cryptoPayment }}>
                {`${t.formatMessage({ id: 'trxn.cryptoPayment' })}: ${entity.cryptoPayment || ''}`}
              </Paragraph>
              <Paragraph copyable={{ text: entity.cryptoAddress }}>
                {`${t.formatMessage({ id: 'trxn.cryptoAddress' })}: ${entity.cryptoAddress || ''}`}
              </Paragraph>
              <Paragraph copyable={{ text: entity.cryptoAmount }} className={styles.cryptoAmount}>
                {`${t.formatMessage({ id: 'trxn.usdtAmount' })}: ${
                  (entity.amount * entity.exchangeRate).toFixed(2) || '0.00'
                }`}
              </Paragraph>
            </>
          );
        }

        return (
          <>
            <Paragraph copyable={{ text: entity.bankName }}>{`${t.formatMessage({
              id: 'trxn.bankName',
            })}: ${entity.bankName || ''}`}</Paragraph>
            <Paragraph copyable={{ text: entity.bankCard }}>{`${t.formatMessage({
              id: 'trxn.bankCard',
            })}: ${entity.bankCard || ''}`}</Paragraph>
            <Paragraph copyable={{ text: entity.accountName }}>{`${t.formatMessage({
              id: 'trxn.accountName',
            })}: ${entity.accountName || ''}`}</Paragraph>
            <Paragraph copyable={{ text: entity.accountNo }}>{`${t.formatMessage({
              id: 'trxn.accountNo',
            })}: ${entity.accountNo || ''}`}</Paragraph>
          </>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.amount' })}</span>,
      dataIndex: 'amount',
      hideInSearch: true,
      render: (v: any) => v.toFixed(2),
    },
    {
      title: <span>{t.formatMessage({ id: 'table.amount' })}</span>,
      dataIndex: 'amountInSearch',
      valueType: 'digitRange',
      hideInTable: true,
      order: 2,
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
      title: <span>{t.formatMessage({ id: 'table.remarks' })}</span>,
      dataIndex: 'remark',
      width: 160,
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
    {
      title: <span>{t.formatMessage({ id: 'table.countdown' })}</span>,
      dataIndex: 'countdown',
      valueType: 'time',
      hideInSearch: true,
      width: 120,
      render: (data: any, value: any) => {
        if (['In Progress', 'Waiting'].includes(value.status)) {
          return <CountDown target={value.acceptedExpiredTime} />;
        }
        return value;
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.createdTime' })}</span>,
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.status' })}</span>,
      dataIndex: 'status',
      order: 3,
      initialValue: 'All',
      width: 100,
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
    {
      title: <span>{t.formatMessage({ id: 'table.time' })}</span>,
      dataIndex: 'createdAtRange',
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
      title: <span>{t.formatMessage({ id: 'table.action' })}</span>,
      dataIndex: 'action',
      valueType: 'option',
      search: false,
      render: (_, value: any) => {
        if (['Under Review'].includes(value.status) && value.paymentType?.groupType === 'Fiat') {
          return (
            <Access key="approve" accessible={access?.MerchantTransaction.Withdrawal.Verify}>
              <Button
                type="primary"
                onClick={() => {
                  setCurrentRow(value);
                  setFiatDepositRequest(true);
                }}
              >
                {t.formatMessage({ id: 'modal.verify' })}
              </Button>
            </Access>
          );
        } else if (
          ['Under Review'].includes(value.status) &&
          value.paymentType?.groupType === 'Crypto'
        ) {
          return (
            <Access key="approve" accessible={access?.MerchantTransaction.Withdrawal.Verify}>
              <Button
                type="primary"
                onClick={() => {
                  setCurrentRow(value);
                  setCryptoDepositRequest(true);
                }}
              >
                {t.formatMessage({ id: 'modal.verify' })}
              </Button>
            </Access>
          );
        } else if (['Waiting'].includes(value.status)) {
          const id = value && value.id;
          const status = value && value.status;
          const remark = value && value.remark;

          return (
            <Access key="approve" accessible={access?.MerchantTransaction.Withdrawal.Cancel}>
              <Button
                type="primary"
                onClick={() =>
                  confirmToggleStatus({ id, status, updateStatus: 'Cancelled', remark })
                }
                danger
              >
                {t.formatMessage({ id: 'modal.cancel' })}
              </Button>
            </Access>
          );
        }
      },
    },
  ];

  useEffect(() => {
    console.log(tableFilters);
    setTableFilters(tableFilters);
  }, [tableFilters]);

  useEffect(() => {
    if (history.location.query?.id !== undefined) {
      const newFilterRefValues = {
        ...tableFilters,
        orderId: history.location.query?.id,
        status: 'All',
      };
      filterRef?.current?.setFieldsValue(newFilterRefValues);
      setTableFilters(newFilterRefValues);
      cookies.set(filterCookieMap['merchant-withdrawal'], newFilterRefValues, { path: '/' });
      filterRef?.current?.submit();
      setHistoryQueryId(true);
    }
  }, [history.length, history.location.query?.id]);

  useEffect(() => {
    fetchDictionaryWithdrawalStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    fetchDictionaryAutoRefreshRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    const currMenuAccess = access?.MerchantTransaction.Withdrawal;
    const withdrawal = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(withdrawal.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('merchant-withdrawal', filterRef);
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
        <ProTable<MerchantWithdrawalItem, Pagination>
          className={styles.withdrawalTable}
          onSubmit={(v: any) => {
            cookies.set(filterCookieMap['merchant-withdrawal'], v, { path: '/' });
            handleAutoRefresh(cookies.get(refRateCookieMap['merchant-withdrawal']));
          }}
          onReset={() => {
            // setSelectedStatus('All');
            cookies.remove(filterCookieMap['merchant-withdrawal'], { path: '/' });
            handleAutoRefresh(cookies.get(refRateCookieMap['merchant-withdrawal']));
            removeQuery();
          }}
          formRef={filterRef}
          request={fetchTableData}
          actionRef={tableRef}
          rowKey="key"
          search={
            access?.MerchantTransaction.Withdrawal['View(Ownonly)'] ||
            access?.MerchantTransaction.Withdrawal['View(forAll)']
          }
          cardBordered={true}
          columns={
            access?.MerchantTransaction.Withdrawal['View(Ownonly)'] ||
            access?.MerchantTransaction.Withdrawal['View(forAll)']
              ? columns
              : []
          }
          options={false}
          pagination={paginationProps}
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
          tableExtraRender={() => (
            <SummaryCounter filter={tableFilters} refreshInterval={selectedRefreshRate} />
          )}
          toolBarRender={() => [
            <Access key="export" accessible={access?.MerchantTransaction.Withdrawal.Export}>
              <Button key="export" type="primary" onClick={handleDownloadExcel}>
                {t.formatMessage({ id: 'table.export' })}
              </Button>
            </Access>,
          ]}
        />
        <FiatDepositRequest
          visible={fiatDepositRequest}
          close={() => {
            setFiatDepositRequest(false);
            setHistoryQueryId(false);
          }}
          currentRow={currentRow}
          onApproveReject={confirmToggleStatus}
        />
        <CryptoDepositRequest
          visible={cryptoDepositRequest}
          close={() => {
            setCryptoDepositRequest(false);
            setHistoryQueryId(false);
          }}
          currentRow={currentRow}
          onApproveReject={confirmToggleStatus}
        />
      </PageContainer>
    </Access>
  );
};

export default MerchantWithdrawal;
