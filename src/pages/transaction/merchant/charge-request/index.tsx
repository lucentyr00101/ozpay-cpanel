/* eslint-disable react-hooks/exhaustive-deps */
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';

import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Card, Col, message, Modal, Result, Row, Typography } from 'antd';

import CountDown from '@/components/Countdown';
import {
  DICTIONARY_TYPE_CODE,
  SORT,
  USER_TYPE,
} from '@/components/enums/dictionary/dictionary.enum';
import CreateWithdrawalRequest from '@/components/Transactions/ChargeRequest/CreateWithdrawalRequest';

import { getMerchant } from '@/pages/merchant/list/service';
import { getAgent } from '@/pages/agent/list/service';
import { fetchAutoRefreshRateByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';

import type { ChargeRequestItem, Pagination } from '../../shared/charge-request/data';
import styles from '../../shared/charge-request/style.less';
import {
  getChargeRequests,
  getChargeRequestsByAdmin,
  payChargeRequest,
} from '../../shared/charge-request/service';
import Cookies from 'universal-cookie';
import { refRateCookieMap } from '@/global';

const MerchantChargeRequest: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const { Text } = Typography;
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const selectedLang = getLocale();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState as any;

  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<any>();
  const [activeKeyTable, setActiveKeyTable] = useState<React.Key>('');
  const [merchant, setMerchant] = useState<any>({ merchantFinance: {} });
  const [autoRefreshRateEnums, setAutoRefreshRateEnums] = useState([]);
  const [showCreateWithdrawal, setShowCreateWithdrawal] = useState<boolean>(false);

  const handleAutoRefresh = (key: any) => {
    // extracts numbers from a string
    const _key = key.match(/(\d+)/)?.[0];
    cookies.set(refRateCookieMap['charge-request'], key, { path: '/' });
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
    const refRateCookie = cookies.get(refRateCookieMap['charge-request']);
    if (refRateCookie) {
      handleAutoRefresh(refRateCookie);
      setActiveKeyTable(refRateCookie);
      return;
    }

    const { key } = data;
    if (key && key.toLowerCase() !== 'off') handleAutoRefresh(key);
  };

  const fetchDictionaryAutoRefreshRate = async () => {
    const autoRefreshEnums = await fetchAutoRefreshRateByDictionaryCode(
      DICTIONARY_TYPE_CODE.Auto_Refresh_Rate_Code,
      selectedLang,
    );
    setInitialRefreshRate(autoRefreshEnums[0]);
    setAutoRefreshRateEnums(() => autoRefreshEnums);
  };

  const getMerchantDetails = async () => {
    if (currentUser?.merchant && currentUser?.merchant.id) {
      if (currentUser.userType === USER_TYPE.Agent) {
        const { data } = await getAgent(currentUser.merchant.id);
        setMerchant(data);
      } else {
        const { data } = await getMerchant(currentUser.merchant.id);
        setMerchant(data);
      }
    }
  };

  const fetchChargeRequests = async (_: any, sort: any) => {
    if (currentUser.userType === USER_TYPE.Admin || currentUser.userType === USER_TYPE.Non_Admin) {
      const data = await getChargeRequestsByAdmin({
        expirationTimeSort:
          sort && sort.acceptedExpiredTime
            ? sort.acceptedExpiredTime === 'ascend'
              ? SORT.Asc
              : SORT.Desc
            : undefined,
        createdTimeSort:
          sort && sort.createdTime
            ? sort.createdTime === 'ascend'
              ? SORT.Asc
              : SORT.Desc
            : undefined,
      });
      // console.log("Admin", data);
      const filteredExpiredData = data.data.filter((val) => {
        const distance = new Date(val.acceptedExpiredTime).getTime() - new Date().getTime();
        return distance > 0;
      });

      return { ...data, data: filteredExpiredData };
    }
    if (currentUser.merchant && currentUser.merchant.id) {
      const data = await getChargeRequests({
        merchantId: currentUser.merchant.id,
        expirationTimeSort:
          sort && sort.acceptedExpiredTime
            ? sort.acceptedExpiredTime === 'ascend'
              ? SORT.Asc
              : SORT.Desc
            : undefined,
        createdTimeSort:
          sort && sort.createdTime
            ? sort.createdTime === 'ascend'
              ? SORT.Asc
              : SORT.Desc
            : undefined,
      });
      const filteredExpiredData = data.data.filter((val) => {
        const distance = new Date(val.acceptedExpiredTime).getTime() - new Date().getTime();
        return distance > 0;
      });
      return { ...data, data: filteredExpiredData };
    }
    return {
      data: [],
    };
  };

  const pay = (record: ChargeRequestItem) => {
    Modal.confirm({
      icon: false,
      title: t.formatMessage({ id: 'modal.payChargeRequest' }),
      content: (
        <span>
          {t.formatMessage({ id: 'modal.payChargeRequestDesc' })}{' '}
          <strong>{record && record.orderId}</strong> ?
        </span>
      ),
      okText: t.formatMessage({ id: 'modal.confirm' }),
      cancelText: t.formatMessage({ id: 'modal.cancel' }),
      onOk: async () => {
        try {
          const data = {
            withdrawalId: record.id,
            merchantId: currentUser?.merchant.id,
            remark: record.remark,
          };
          await payChargeRequest(data);
          tableRef?.current?.reloadAndRest?.();
          message.success(t.formatMessage({ id: 'messages.saved' }));
        } catch (e: any) {
          message.error(e?.data?.message || 'Something went wrong.');
        }
      },
    });
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

  const columns: ProColumns<ChargeRequestItem>[] = [
    {
      title: '#',
      dataIndex: 'index',
      valueType: 'index',
    },
    {
      title: t.formatMessage({ id: 'table.orderID' }),
      dataIndex: 'orderId',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      render: (v: any) => v.toFixed(2),
    },
    {
      title: t.formatMessage({ id: 'table.paymentType' }),
      dataIndex: ['paymentType', 'name'],
    },
    {
      title: t.formatMessage({ id: 'table.remarks' }),
      dataIndex: 'remark',
      render: (v: any) => {
        return v.split(',').map((text: string) => {
          return (
            <p key={text} style={{ marginBottom: '0' }}>
              {remarksDict[text] || text}
            </p>
          );
        });
      },
    },
    {
      title: t.formatMessage({ id: 'table.createdTime' }),
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: t.formatMessage({ id: 'table.expirationTime' }),
      dataIndex: 'acceptedExpiredTime',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.countdown' })}</span>,
      dataIndex: 'countdown',
      valueType: 'time',
      hideInSearch: true,
      width: 120,
      render: (data: any, value) => {
        return (
          <CountDown
            target={value.acceptedExpiredTime}
            onRefreshFetchChargeRequests={fetchChargeRequests}
          />
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.action' })}</span>,
      dataIndex: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <Access
          accessible={
            access?.MerchantTransaction.ChargeRequest.Pay &&
            ((currentUser.userType !== 'Admin' && currentUser.userType !== 'Non-Admin') ||
              (currentUser?.userType === 'Non-Admin' && currentUser?.parentMerchantType))
          }
        >
          <Button type="primary" onClick={() => pay(record)}>
            {t.formatMessage({ id: 'table.pay' })}
          </Button>
        </Access>
      ),
    },
  ];

  useEffect(() => {
    fetchDictionaryAutoRefreshRate();
  }, [selectedLang]);

  useEffect(() => {
    const currMenuAccess = access?.MerchantTransaction.ChargeRequest;
    const chargeRequest = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(chargeRequest.length > 0);
    getMerchantDetails();
  }, []);

  useEffect(() => {
    getMerchantDetails();
  }, [currentUser]);

  return (
    <>
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
          <ProTable<ChargeRequestItem, Pagination>
            actionRef={tableRef}
            className={styles.chargeRequest}
            headerTitle={t.formatMessage({ id: 'table.headerTitle.autoRefesh' })}
            request={fetchChargeRequests}
            search={false}
            options={false}
            columns={access?.MerchantTransaction.ChargeRequest.List ? columns : []}
            rowKey="id"
            tableExtraRender={() => (
              <>
                <Card
                  bordered={false}
                  style={{ marginBottom: 24 }}
                  bodyStyle={{ paddingLeft: '3rem' }}
                >
                  <Row gutter={30} align="middle">
                    <Col>
                      <Text>
                        {t.formatMessage({ id: 'trxn.accountBalance' })}:{' '}
                        <span style={{ fontSize: 16, fontWeight: 500 }}>
                          {merchant && merchant.merchantFinance && merchant.merchantFinance.balance
                            ? merchant.merchantFinance.balance?.toFixed(2)
                            : (0.0).toFixed(2)}
                        </span>
                      </Text>
                    </Col>
                    <Col>
                      <Access
                        accessible={
                          access?.MerchantTransaction.ChargeRequest.Withdrawal &&
                          ((currentUser.userType !== USER_TYPE.Admin &&
                            currentUser.userType !== USER_TYPE.Non_Admin) ||
                            (currentUser?.userType === USER_TYPE.Non_Admin &&
                              currentUser?.parentMerchantType))
                        }
                      >
                        <Button type="primary" onClick={() => setShowCreateWithdrawal(true)}>
                          {t.formatMessage({ id: 'table.Withdrawal' })}
                        </Button>
                      </Access>
                    </Col>
                  </Row>
                </Card>
              </>
            )}
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
          />
        </PageContainer>
      </Access>
      <CreateWithdrawalRequest
        visible={showCreateWithdrawal}
        close={() => setShowCreateWithdrawal(false)}
        reloadTable={() => tableRef?.current?.reloadAndRest?.()}
      />
    </>
  );
};

export default MerchantChargeRequest;
