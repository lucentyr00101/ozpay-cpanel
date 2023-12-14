/* eslint-disable react-hooks/exhaustive-deps */
import type { FC } from 'react';
import { useEffect } from 'react';
import { useRef, useState } from 'react';

import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';

import { Badge, Button, Result, Typography, message } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormDigitRange } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';

import CountDown from '@/components/Countdown';
import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
import FiatDepositRequest from '@/components/Transactions/Deposit/DepositRequest/FiatDepositRequest';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import CryptoDepositRequest from '@/components/Transactions/Deposit/CryptoDepositRequest';
import SummaryCounter from '@/components/Transactions/Deposit/Summary';

import {
  fetchAutoRefreshRateByDictionaryCode,
  fetchStatusByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';

import type { MerchantDepositItem, Pagination } from '../../shared/deposit/data.d';
import styles from '../../shared/deposit/style.less';
import { getMerchantsDepositExport } from '../../shared/deposit/service';

import { maxLength } from '@/global';
import { fetchDeposits, updateDeposit } from './service';
import Cookies from 'universal-cookie';
import { refRateCookieMap, filterCookieMap, setFilters } from '@/global';

const MerchantDesposit: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { Link, Paragraph } = Typography;
  const { initialState } = useModel('@@initialState');

  const [statusEnums, setStatusEnums] = useState({});
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentFileterValue, setCurrentFileterValue] = useState({
    page: 0,
    size: 20,
    sort: 'Desc',
    status: 'All',
  });
  const [autoRefreshRateEnums, setAutoRefreshRateEnums] = useState([]);
  const [activeKeyTable, setActiveKeyTable] = useState<React.Key>(5);
  const [currentRow, setCurrentRow] = useState<MerchantDepositItem>();
  const [fiatDepositRequest, setFiatDepositRequest] = useState<boolean>(false);
  const [cryptoDepositRequest, setCryptoDepositRequest] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<any>();
  const [selectedRefreshRate, setSelectedRefreshRate] = useState('');
  const [tableFilters, setTableFilters] = useState<any>(filterRef?.current?.getFieldsValue(true));

  const filterRefValues = filterRef?.current?.getFieldsValue(true);

  const handleAutoRefresh = (key: any) => {
    // extracts numbers from a string
    const _key = key.match(/(\d+)/)?.[0];
    cookies.set(refRateCookieMap['merchant-deposit'], key, { path: '/' });
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
    const refRateCookie = cookies.get(refRateCookieMap['merchant-deposit']);
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

  const downloadFromBlob = (blob: Blob) => {
    const { currentUser } = initialState as any;
    const { username } = currentUser;
    const blobData = new Blob([blob], { type: '' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobData);
    link.download = `${t.formatMessage({
      id: 'menu.MerchantTransaction',
    })}-${t.formatMessage({ id: 'menu.MerchantTransaction.Deposit' })}_${username}.xlsx`;
    link.click();
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

    const res = await getMerchantsDepositExport(newfilterValueExcludeSizeAndPage);
    downloadFromBlob(res);
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
    const refRateCookie = cookies.get(refRateCookieMap['merchant-withdrawal']);
    const _key = !!refRateCookie
      ? refRateCookie.match(/(\d+)/)?.[0]
      : autoRefreshEnums[0].key.match(/(\d+)/)?.[0];
    setSelectedRefreshRate(_key);
    setAutoRefreshRateEnums(autoRefreshEnums);
  };

  const fetchDepositList = async (values: any) => {
    const {
      updatedAtRange,
      pageSize: size,
      current: page,
      withdrawal,
      merchant,
      status,
      amountInSearch,
    } = values;
    const filter: any = {
      size,
      page: page - 1,
      merchantUsername: merchant && merchant.username,
      orderId: withdrawal && withdrawal.orderId,
      status,
    };

    if (updatedAtRange) {
      const [fromDate, toDate] = updatedAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    if (amountInSearch?.length) {
      const [minAmount, maxAmount] = amountInSearch;
      filter.minAmount = minAmount.toFixed(2);
      filter.maxAmount = maxAmount.toFixed(2);
    }

    setCurrentFileterValue(filter);
    const data = await fetchDeposits(filter);

    return data;
  };

  const handleCancelDeposit = async (id: string) => {
    try {
      const newForm = new FormData();
      newForm.set('files', new Blob([]));
      newForm.set(
        'merchantToMerchantDepositUpdateParam',
        new Blob(
          [
            JSON.stringify({
              depositId: id,
              status: 'Cancelled',
            }),
          ],
          { type: 'application/json' },
        ),
      );
      await updateDeposit(newForm);
      message.success(t.formatMessage({ id: 'table.Cancelled' }));
      tableRef?.current?.reloadAndRest?.();
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
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

  const columns: ProColumns<MerchantDepositItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.username' })}</span>,
      dataIndex: ['merchant', 'username'],
      ellipsis: true,
      order: 1,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.orderID' })}</span>,
      dataIndex: ['withdrawal', 'orderId'],
      order: 4,
      render: (value, entity: any) => {
        if (entity.paymentType?.groupType === 'Crypto') {
          return (
            <Link
              href="#"
              onClick={() => {
                setCurrentRow(entity);
                setCryptoDepositRequest(true);
              }}
            >
              {value}
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
            {value}
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
      render: (value: any, entity) => {
        const { withdrawal } = entity;
        const { cryptoAddress, cryptoPayment, exchangeRate } = withdrawal;
        const isCrypto = !!cryptoAddress && !!cryptoPayment && exchangeRate;

        if (isCrypto) {
          return (
            <>
              <Paragraph ellipsis copyable>{`${t.formatMessage({ id: 'trxn.cryptoPayment' })}: ${
                entity.withdrawal.cryptoPayment || ''
              }`}</Paragraph>
              <Paragraph ellipsis copyable>{`${t.formatMessage({ id: 'trxn.cryptoAddress' })}: ${
                entity.withdrawal.cryptoAddress || ''
              }`}</Paragraph>
              <Paragraph copyable className={styles.cryptoAmount}>{`${t.formatMessage({
                id: 'trxn.usdtAmount',
              })}: ${
                entity.withdrawal.amount * entity.withdrawal.exchangeRate || '0.00'
              }`}</Paragraph>
            </>
          );
        }

        return (
          <>
            <Paragraph copyable>{`${t.formatMessage({ id: 'trxn.bankName' })}: ${
              entity.withdrawal.bankName || ''
            }`}</Paragraph>
            <Paragraph copyable>{`${t.formatMessage({ id: 'trxn.bankCard' })}: ${
              entity.withdrawal.bankCard || ''
            }`}</Paragraph>
            <Paragraph copyable>{`${t.formatMessage({ id: 'trxn.accountName' })}: ${
              entity.withdrawal.accountName || ''
            }`}</Paragraph>
            <Paragraph copyable>{`${t.formatMessage({ id: 'trxn.accountNo' })}: ${
              entity.withdrawal.accountNo || ''
            }`}</Paragraph>
          </>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.amount' })}</span>,
      dataIndex: ['withdrawal', 'amount'],
      hideInSearch: true,
      render: (v: any) => {
        if (v !== '' && v !== '-') {
          return v.toFixed(2);
        }
        return null;
      },
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
      title: <span>{t.formatMessage({ id: 'table.fee' })}</span>,
      dataIndex: 'fee',
      hideInSearch: true,
      render: (v: any) => {
        if (v !== '' && v !== '-') {
          return v.toFixed(2);
        }
        return null;
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.remarks' })}</span>,
      dataIndex: 'remark',
      hideInSearch: true,
      tooltip: true,
      width: 150,
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
      dataIndex: 'paymentExpiryTime',
      valueType: 'time',
      hideInSearch: true,
      width: 120,
      render: (_, value) => {
        if (['In Progress'].includes(value.status)) {
          return <CountDown target={value.paymentExpiryTime} />;
        }
        return value;
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.finishedTime' })}</span>,
      dataIndex: 'finishedTime',
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
      dataIndex: 'updatedAtRange',
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
        return (
          <>
            <Button
              type="primary"
              style={{ marginBottom: 10 }}
              onClick={() => {
                setCurrentRow(value);
                return value.paymentType?.groupType === 'Crypto'
                  ? setCryptoDepositRequest(true)
                  : setFiatDepositRequest(true);
              }}
            >
              {['In Progress'].includes(value.status)
                ? t.formatMessage({ id: 'modal.submit' })
                : ['Under Review'].includes(value.status)
                ? t.formatMessage({ id: 'modal.update' })
                : null}
            </Button>
            {value.status === 'In Progress' && (
              <Button type="primary" danger onClick={() => handleCancelDeposit(value.id)}>
                {t.formatMessage({ id: 'modal.cancel' })}
              </Button>
            )}
          </>
        );
      },
    },
  ];

  // const downloadExcel = () => {
  //   const aoa = [
  //     [
  //       `${t.formatMessage({ id: 'table.username' })}`,
  //       `${t.formatMessage({ id: 'table.orderID' })}`,
  //       `${t.formatMessage({ id: 'table.paymentType' })}`,
  //       `${t.formatMessage({ id: 'table.paymentInfo' })}`,
  //       `${t.formatMessage({ id: 'table.amount' })}`,
  //       `${t.formatMessage({ id: 'table.fee' })}`,
  //       `${t.formatMessage({ id: 'table.remarks' })}`,
  //       `${t.formatMessage({ id: 'table.createdTime' })}`,
  //       `${t.formatMessage({ id: 'table.status' })}`,
  //     ],
  //   ];

  //   if (tableListDataSource.length > 0) {
  //     tableListDataSource.forEach((item: MerchantDepositItem, index) => {
  //       if (index >= 9999) {
  //         return;
  //       }
  //       aoa.push([
  //         (index + 1).toString(),
  //         item.username,
  //         item.orderId.toString(),
  //         item.paymentType,
  //         'payment Info',
  //         item.amount.toString(),
  //         item.remarks,
  //         'createdTime',
  //         item.status,
  //       ]);
  //     });
  //     const ws = XLSX.utils.aoa_to_sheet(aoa);
  //     const wb = XLSX.utils.book_new();

  //     XLSX.utils.book_append_sheet(
  //       wb,
  //       ws,
  //       `${t.formatMessage({ id: 'menu.MerchantTransaction.Deposit' })}`,
  //     );
  //     XLSX.writeFile(
  //       wb,
  //       `${t.formatMessage({ id: 'menu.MerchantTransaction' })}-${t.formatMessage({
  //         id: 'menu.MerchantTransaction.Deposit',
  //       })}.xlsx`,
  //     );
  //     return;
  //   }
  //   message.error(t.formatMessage({ id: 'table.excel.emptyRow' }));
  // };

  useEffect(() => {
    setTableFilters(filterRefValues);
  }, [filterRefValues]);

  useEffect(() => {
    fetchDictionaryDepositStatus();
  }, [selectedLang]);

  useEffect(() => {
    fetchDictionaryAutoRefreshRate();
  }, [selectedLang]);

  useEffect(() => {
    const currMenuAccess = access?.MerchantTransaction.Deposit;
    const desposit = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(desposit.length > 0);
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('merchant-deposit', filterRef);
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
        <ProTable<MerchantDepositItem, Pagination>
          className={styles.merchantDepositTable}
          onSubmit={(v: any) => {
            cookies.set(filterCookieMap['merchant-deposit'], v, { path: '/' });
            handleAutoRefresh(cookies.get(refRateCookieMap['merchant-deposit']));
          }}
          onReset={() => {
            cookies.remove(filterCookieMap['merchant-deposit'], { path: '/' });
            handleAutoRefresh(cookies.get(refRateCookieMap['merchant-deposit']));
          }}
          formRef={filterRef}
          actionRef={tableRef}
          request={fetchDepositList}
          rowKey="key"
          options={false}
          cardBordered={true}
          pagination={paginationProps}
          search={
            access?.MerchantTransaction.Deposit['View(Ownonly)'] ||
            access?.MerchantTransaction.Deposit['View(forAll)']
          }
          columns={
            access?.MerchantTransaction.Deposit['View(Ownonly)'] ||
            access?.MerchantTransaction.Deposit['View(forAll)']
              ? columns
              : []
          }
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
            <Access key="export" accessible={access?.MerchantTransaction.Deposit.Export}>
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
            setCurrentRow(undefined);
          }}
          currentRow={currentRow}
          reloadTable={() => tableRef?.current?.reloadAndRest?.()}
        />
        <CryptoDepositRequest
          visible={cryptoDepositRequest}
          close={() => {
            setCryptoDepositRequest(false);
            setCurrentRow(undefined);
          }}
          currentRow={currentRow}
          reloadTable={() => tableRef?.current?.reloadAndRest?.()}
        />
      </PageContainer>
    </Access>
  );
};

export default MerchantDesposit;
