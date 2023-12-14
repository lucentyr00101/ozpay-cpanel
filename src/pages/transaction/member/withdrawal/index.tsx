/* eslint-disable react/no-unescaped-entities */
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';

import { useAccess, Access, useIntl, getLocale, history } from 'umi';

import { Badge, Button, message, Popconfirm, Result, Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormDigitRange } from '@ant-design/pro-form';
import type { ProColumns, ActionType } from '@ant-design/pro-table';

import styles from '../../shared/withdrawal/style.less';
import type { WithdrawalItem, Pagination } from '../../shared/withdrawal/data';
import { getWithdrawalList, updateStatus } from '../../shared/withdrawal/service';

import WithdrawalDetails from '@/components/Transactions/Withdrawal/Details';
import ImportModal from '@/components/Transactions/Withdrawal/Import';
import AddWithdrawal from '@/components/Transactions/Withdrawal/Add';
import RejectWithdrawal from '@/components/Transactions/Withdrawal/RejectRemarks';

import { maxLength } from '@/global';
import { getPaymentTypeList } from '@/pages/transaction/shared/fiat-payment-type/service';
import {
  fetchStatusByDictionaryCode,
  fetchAutoRefreshRateByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Cookies from 'universal-cookie';
import { refRateCookieMap, filterCookieMap, setFilters } from '@/global';

const MemberWithdrawal: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const filterRef = useRef<ProFormInstance>();
  const tableRef = useRef<ActionType>();
  // const verifyBtn = useRef<any>();

  const [statusEnums, setStatusEnums] = useState({});
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<WithdrawalItem>();
  const [activeKeyTable, setActiveKeyTable] = useState<React.Key>(5);
  const [autoRefreshRateEnums, setAutoRefreshRateEnums] = useState([]);
  const [importModalVisible, handleImportModalVisible] = useState<boolean>(false);
  const [addWithdrawalModalVisible, handleAddWithdrawalModalVisible] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<any>();
  const [tableData, setTableData] = useState<WithdrawalItem[]>([]);
  const [receipt, setReceipt] = useState<boolean>(false);
  const [receiptImg, setReceiptImg] = useState<any>();
  const [receiptID, setReceiptID] = useState<any>();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [historyQueryId, setHistoryQueryId] = useState<boolean>(false);

  const handleAutoRefresh = (key: any) => {
    // extracts numbers from a string
    const _key = key.match(/(\d+)/)?.[0];
    cookies.set(refRateCookieMap['member-withdrawal'], key, { path: '/' });
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
    const refRateCookie = cookies.get(refRateCookieMap['member-withdrawal']);
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

  const fetchDictionaryWithdrawalStatus = async () => {
    const statusEnumValue = await fetchStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Withdrawal_Status_Code,
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

  const toggleStatusWithdrawal = async (id: string, status: string, remark?: string) => {
    try {
      await updateStatus({
        id,
        status,
        ...(remark && { remark }),
      });
      message.success(t.formatMessage({ id: 'messages.cancelWithdraw' }));
      tableRef?.current?.reloadAndRest?.();
      setReceipt(false);
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong');
    }
  };

  const confirmToggleStatus = async ({ id, status, updateStatus: _updateStatus }: any) => {
    if (['Waiting', 'Under Review'].includes(status)) {
      await toggleStatusWithdrawal(id, _updateStatus);
    }
  };

  async function VerifyTrans({ receiptID: _receiptId, updateStatus: _updateStatus }: any) {
    const funcs = {
      Completed: () => {
        Modal.confirm({
          centered: true,
          icon: <ExclamationCircleOutlined />,
          content: t.formatMessage({ id: 'modal.approvemsg' }),
          okText: t.formatMessage({ id: 'modal.yes' }),
          cancelText: t.formatMessage({ id: 'modal.no' }),
          onOk: async () => await toggleStatusWithdrawal(_receiptId, _updateStatus),
        });
      },
      Rejected: () => {
        Modal.confirm({
          centered: true,
          icon: <ExclamationCircleOutlined />,
          content: t.formatMessage({ id: 'modal.rejectmsg' }),
          okText: t.formatMessage({ id: 'modal.yes' }),
          cancelText: t.formatMessage({ id: 'modal.no' }),
          onOk: async () => setShowRejectModal(true),
        });
      },
    };
    funcs[_updateStatus]();
  }

  function setFlexToAuto(childNum: number, auto: boolean = true) {
    const timeField = document.querySelector<HTMLElement>(
      `[class*="withdrawalTable"] .ant-row.ant-row-start div:nth-child(${childNum}) .ant-col.ant-form-item-label`,
    );
    if (timeField) {
      if (auto) {
        timeField.style.setProperty('flex', '0 0 auto');
      } else {
        timeField.style.setProperty('flex', '0 0 80px');
      }
    }
  }

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

  const fetchTableData = async (values: any, sort) => {
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
    } = values;
    console.log({ values, sort });
    const filter: any = {
      size,
      page: page - 1,
      ...(orderId && { orderId }),
      ...(status && { status }),
      // ...(memberUsername && { memberUsername }),
      ...(paymentTypeTag && { paymentTypeTag }),
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

    if (merchant) {
      const { username } = merchant.sysUser;
      if (username) {
        filter.merchantUsername = username;
      }
    }

    if (amountInSearch?.length) {
      const [minAmount, maxAmount] = amountInSearch;
      filter.minAmount = minAmount.toFixed(2);
      filter.maxAmount = maxAmount.toFixed(2);
    }

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const data = await getWithdrawalList(filter);

    return data;
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

  const columns: ProColumns<WithdrawalItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.merchant' })}</span>,
      dataIndex: ['merchant', 'sysUser', 'username'],
      order: 4,
      ellipsis: true,
      fieldProps: {
        maxLength: maxLength.NAME,
        placeholder: t.formatMessage({ id: 'modal.merchant' }),
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.member' })}</span>,
      dataIndex: ['member', 'username'],
      order: 3,
      fieldProps: {
        maxLength: maxLength.NAME,
        placeholder: t.formatMessage({ id: 'table.userName' }),
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.orderID' })}</span>,
      dataIndex: 'orderId',
      order: 6,
      initialValue: history?.location?.query?.id,
      fieldProps: {
        placeholder: t.formatMessage({ id: 'table.orderID' }),
      },
      render: (dom, entity) => {
        if (historyQueryId) {
          setCurrentRow(entity);
          setShowDetail(true);
        }
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
      dataIndex: ['paymentType', 'groupType'],
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentInfo' })}</span>,
      dataIndex: 'paymentInfo',
      hideInSearch: true,
      width: 230,
      fieldProps: {
        placeholder: '',
      },
      render: (value, entity: any) => {
        if (entity.paymentType?.groupType === 'Crypto') {
          const cryptoAmount = entity.amount * entity.exchangeRate;
          return (
            <div className={styles.paymentInfo}>
              <p style={{ marginBottom: '0' }}>{entity.paymentType && entity.paymentType.name}</p>
              <p style={{ marginBottom: '0' }}>{entity.cryptoAddress}</p>
              <p style={{ marginBottom: '0' }}>{`${t.formatMessage({ id: 'trxn.usdtAmount' })}: ${
                cryptoAmount || ''
              }`}</p>
              <p style={{ marginBottom: '0' }}>{`${t.formatMessage({ id: 'trxn.exchangeRate' })}: ${
                entity.exchangeRate || ''
              }`}</p>
            </div>
          );
        }

        return (
          <div className={styles.paymentInfo}>
            <p style={{ marginBottom: '0' }}>{entity.paymentType && entity.paymentType.name}</p>
            <p style={{ marginBottom: '0' }}>
              {entity.bankName} - {entity.accountName}
            </p>
            <p style={{ marginBottom: '0' }}>{entity.accountNo}</p>
          </div>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.paymentType' })}</span>,
      dataIndex: 'paymentTypeTag',
      hideInTable: true,
      order: 2,
      initialValue: '',
      fieldProps: {
        placeholder: '',
      },
      request: async () => await fetchPaymentList(),
    },
    {
      title: <span>{t.formatMessage({ id: 'table.amount' })}</span>,
      dataIndex: 'amountInSearch',
      valueType: 'digitRange',
      hideInTable: true,
      order: 1,
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
      dataIndex: 'amount',
      hideInSearch: true,
      render: (v: any) => v.toFixed(2),
      fieldProps: {
        placeholder: ['', ''],
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
      order: 5,
      initialValue: 'All',
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
      title: <span>{t.formatMessage({ id: 'table.action' })}</span>,
      dataIndex: 'action',
      valueType: 'option',
      search: false,
      render: (_, value) => {
        const id = value.id;
        const status = value.status;
        const deposit = value.deposit;
        return (
          <>
            <Access accessible={access?.MemberTransaction?.Withdrawal.Cancel}>
              <Popconfirm
                placement="topRight"
                title={t.formatMessage({ id: 'trxn.cancelWithdraw' })}
                onConfirm={() => confirmToggleStatus({ id, status, updateStatus: 'Cancelled' })}
                okText={t.formatMessage({ id: 'table.Yes' })}
                cancelText={t.formatMessage({ id: 'table.No' })}
              >
                {status === 'Waiting' && (
                  <Button type="link">{t.formatMessage({ id: 'modal.cancel' })}</Button>
                )}
              </Popconfirm>
            </Access>

            <Access accessible={access?.MemberTransaction?.Withdrawal.Verify}>
              {status === 'Under Review' && (
                <Button
                  onClick={() => {
                    setReceipt(true);
                    setReceiptID(id);
                    setReceiptImg(deposit.receipt);
                  }}
                  type="link"
                >
                  {t.formatMessage({ id: 'table.verify' })}
                </Button>
              )}
            </Access>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    fetchDictionaryWithdrawalStatus();
    fetchDictionaryAutoRefreshRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  // const openVerify = () => verifyBtn?.current?.click?.();

  // const openDetailsModal = (data: WithdrawalItem) => {
  //   setCurrentRow(data);
  //   setShowDetail(true);
  // };

  // useEffect(() => {
  //   const id = history?.location?.query?.id;
  //   const data = tableData?.find((_tableData) => _tableData.orderId === id);
  //   if (id && data) {
  //     if (data.status === 'Under Review') openVerify();
  //     else openDetailsModal(data);
  //   }
  // }, [tableData]);

  useEffect(() => {
    const _data = tableData?.find((_tableData) => _tableData.id === currentRow?.id);
    if (_data) setCurrentRow(_data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  useEffect(() => {
    setFlexToAuto(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currMenuAccess = access?.MemberTransaction?.Withdrawal;
    const withdrawal = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(withdrawal.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (history.location.query?.id !== undefined) {
      const cookieFilters = cookies.get(filterCookieMap['member-withdrawal']) || {};
      const newFilterRefValues = {
        ...cookieFilters,
        orderId: history.location.query?.id,
        status: 'All',
      };
      filterRef?.current?.setFieldsValue(newFilterRefValues);
      cookies.set(filterCookieMap['member-withdrawal'], newFilterRefValues, { path: '/' });
      filterRef?.current?.submit();
      setHistoryQueryId(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length, history.location.query?.id]);

  useEffect(() => {
    if (filterRef) {
      setFilters('member-withdrawal', filterRef);
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
        <ProTable<WithdrawalItem, Pagination>
          // headerTitle="查询表格"
          actionRef={tableRef}
          formRef={filterRef}
          className={styles.withdrawalTable}
          rowKey="key"
          onLoadingChange={(v) => setTableLoading(v as boolean)}
          cardBordered={true}
          pagination={paginationProps}
          onSubmit={(v: any) => cookies.set(filterCookieMap['member-withdrawal'], v, { path: '/' })}
          onReset={() => {
            cookies.remove(filterCookieMap['member-withdrawal'], { path: '/' });
            removeQuery();
          }}
          request={fetchTableData}
          search={
            access?.MemberTransaction.Withdrawal['View(Ownonly)'] ||
            access?.MemberTransaction.Withdrawal['View(forAll)']
          }
          columns={
            access?.MemberTransaction.Withdrawal['View(Ownonly)'] ||
            access?.MemberTransaction.Withdrawal['View(forAll)']
              ? columns
              : []
          }
          onDataSourceChange={(v) => setTableData(v)}
          options={false}
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
          toolBarRender={() => [
            <Access key="add" accessible={access?.MemberTransaction?.Withdrawal.Add}>
              <Button
                key="add"
                onClick={() => {
                  handleAddWithdrawalModalVisible(true);
                }}
              >
                {t.formatMessage({ id: 'table.add' })}
              </Button>
            </Access>,
            <Access key="import" accessible={access?.MemberTransaction?.Withdrawal.Import}>
              <Button
                key="import"
                type="primary"
                onClick={() => {
                  handleImportModalVisible(true);
                }}
              >
                {t.formatMessage({ id: 'table.import' })}
              </Button>
            </Access>,
          ]}
          // search={{
          //   onCollapse: (collapsed: boolean) => {
          //     if (collapsed) {
          //       setFlexToAuto(1);
          //     } else {
          //       setFlexToAuto(1, false);
          //     }
          //   },
          // }}
        />
        <AddWithdrawal
          visible={addWithdrawalModalVisible}
          close={() => handleAddWithdrawalModalVisible(false)}
          reloadTable={() => tableRef?.current?.reloadAndRest?.()}
        />
        <ImportModal
          visible={importModalVisible}
          close={() => handleImportModalVisible(false)}
          reloadTable={() => tableRef?.current?.reloadAndRest?.()}
        />
        <WithdrawalDetails
          visible={showDetail}
          close={() => {
            setShowDetail(false);
            setHistoryQueryId(false);
          }}
          currentRow={currentRow}
          reloadTable={() => tableRef?.current?.reloadAndRest?.()}
          loading={tableLoading}
        />
        <RejectWithdrawal
          visible={showRejectModal}
          close={() => setShowRejectModal(false)}
          id={receiptID}
          reject={toggleStatusWithdrawal}
        />
        <ModalForm
          title={t.formatMessage({ id: 'modal.depositApproval' })}
          visible={receipt}
          modalProps={{
            destroyOnClose: true,
            centered: true,
            onCancel: () => setReceipt(false),
          }}
          submitter={{
            render: () => {
              return [
                <Button type="default" key="cancel" onClick={() => setReceipt(false)}>
                  {t.formatMessage({ id: 'modal.cancel' })}
                </Button>,
                <Button
                  onClick={() => VerifyTrans({ receiptID, updateStatus: 'Rejected' })}
                  type="primary"
                  danger
                  key="reject"
                >
                  {t.formatMessage({ id: 'modal.reject' })}
                </Button>,
                <Button
                  onClick={() => VerifyTrans({ receiptID, updateStatus: 'Completed' })}
                  type="primary"
                  key="confirm"
                >
                  {t.formatMessage({ id: 'modal.approve' })}
                </Button>,
              ];
            },
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img src={receiptImg} style={{ maxWidth: '100%' }} />
          </div>
        </ModalForm>
      </PageContainer>
    </Access>
  );
};

export default MemberWithdrawal;
