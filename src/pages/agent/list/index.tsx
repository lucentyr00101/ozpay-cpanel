import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';

import { Button, Switch, Alert, Space, Result, message, Form } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import { Access, useAccess, useIntl, getLocale } from 'umi';

import type { ListItem, Pagination } from './data';

import { getAgentList, addAgent, updateAgent, getAgent, updateAgentStatus } from './service';
import { resetOTP, updateWhitelist } from '@/pages/system-settings/users/service';
import { fetchMerchantMemberStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';

import AddNewMerchant from '@/components/Agent/AddMerchant';
import ResetOTP from '@/components/Agent/ResetOTP';
import IPAddress from '@/components/Agent/IPAddress';

import styles from './style.less';
import Cookies from 'universal-cookie';
import { maxLength, filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const Merchants: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const [form] = Form.useForm();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const selectedLang = getLocale();

  const [otpError, setOtpError] = useState('');
  const [editMerchant, setEditMerchant] = useState({});
  const [modalTitle, setModalTitle] = useState('Add New Agent');
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [addMerchantModal, setAddMerchantModal] = useState(false);
  const [resetOTPModal, setResetOTP] = useState(false);
  const [ipAddressModal, setIPAddress] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState({} as ListItem);
  const [statusEnums, setStatusEnums] = useState({});
  const [resetOtpType, setResetOtpType] = useState('');

  const fetchDictionaryAgentStatus = async () => {
    const statusEnumValue = await fetchMerchantMemberStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Merchant_Member_Status_Code,
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

  const showResetOTP = (value: boolean) => {
    setResetOTP(value);
  };
  const showIPAddress = (value: boolean) => {
    setIPAddress(value);
  };

  const handleEditMerchant = async (values: any) => {
    const { data: merchantDetail } = await getAgent(values.id);
    // console.log({ merch: values, merchantDetail });
    const { sysUser, minDepositLimit, maxDepositLimit, minWithdrawalLimit, maxWithdrawalLimit } =
      merchantDetail;
    const _merchant = {
      ...merchantDetail,
      name: sysUser.username,
      status: sysUser.status,
      password: sysUser.password,
      withdrawalMin: minWithdrawalLimit,
      withdrawalMax: maxWithdrawalLimit,
      depositMin: minDepositLimit,
      depositMax: maxDepositLimit,
    };
    setModalTitle(t.formatMessage({ id: 'modal.editAgent' }));
    setEditMerchant(_merchant);
    setAddMerchantModal(true);
    form.setFieldsValue(_merchant);
  };

  const [hasCopied] = useState(false);
  // const copyLink = (link: string) => {
  //   navigator.clipboard.writeText(link);
  //   setHasCopied(true);

  //   setTimeout(() => setHasCopied(false), 1500);
  // };

  useEffect(() => {
    if (!addMerchantModal) {
      setEditMerchant({});
      setModalTitle(t.formatMessage({ id: 'modal.addAgent' }));
    }
  }, [addMerchantModal, t]);

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

  const handleFetchMerchantList = async (values: any, sort: any) => {
    const { createdAtRangedAt, pageSize: size, current: page, sysUser } = values;
    const filter: any = {
      size,
      page: page - 1,
      status: sysUser.status,
      sort: sort && sort['sysUser,createdTime'] === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRangedAt) {
      const [fromDate, toDate] = createdAtRangedAt;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    if (sysUser) {
      filter.username = sysUser.username;
    }

    const response = await getAgentList(filter);

    return response;
  };

  const handleAddMerchant = async (values: any) => {
    const {
      depositMax: maxDepositLimit,
      depositMin: minDepositLimit,
      merchantDepositRate: merchantDepositRate,
      depositRate: depositRate,
      agentDepositRate: agentDepositRate,
      name: username,
      password,
      memberPlatformLink,
      status,
      withdrawalMax: maxWithdrawalLimit,
      withdrawalMin: minWithdrawalLimit,
      level,
      platformName,
    } = values;

    const data = {
      sysUser: {
        id: modalTitle.includes('Edit') ? editMerchant.sysUser.id : '',
        username,
        status,
        password,
      },
      level,
      memberPlatformLink,
      merchantDepositRate: (+merchantDepositRate).toFixed(2),
      depositRate: (+depositRate).toFixed(2),
      agentDepositRate: (+agentDepositRate).toFixed(2),
      maxWithdrawalLimit,
      minWithdrawalLimit,
      maxDepositLimit,
      minDepositLimit,
      platformName,
    };
    try {
      if (modalTitle.includes('Edit') || modalTitle.includes('编辑')) {
        await updateAgent({ ...data, sysUser: { ...data.sysUser }, id: editMerchant.id });
        setAddMerchantModal(false);
        // fetchMerchantList();
        tableRef?.current?.reloadAndRest?.();
        message.success(t.formatMessage({ id: 'messages.updateAgent' }));
      } else {
        await addAgent(data as any);
        setAddMerchantModal(false);
        // fetchMerchantList();
        tableRef?.current?.reloadAndRest?.();
        message.success(t.formatMessage({ id: 'messages.addAgent' }));
      }
    } catch (error: any) {
      if (error.data.code == 1012001) {
        message.error(t.formatMessage({ id: 'messages.agentDepositRateShouldNotBeLessThan0' }));
      } else if (error.data.code == 2020002) {
        message.error(t.formatMessage({ id: 'messages.merchantNameExist' }));
      } else {
        message.error(error.data.message);
      }
    }
  };

  const handleUpdateWhitelist = async (values: any) => {
    try {
      console.log(values);
      const data = await updateWhitelist({
        ipWhitelist: values.ipAddress,
        id: selectedMerchant.sysUser.id,
      });
      if (data.success) {
        setIPAddress(false);
        // fetchMerchantList();
        tableRef?.current?.reloadAndRest?.();
        message.success(t.formatMessage({ id: 'messages.updateIP' }));
      }
    } catch (error: any) {
      if (error.data.code == 1012001) {
        message.error(t.formatMessage({ id: 'messages.ipCannotEmpty' }));
      } else {
        message.error(error.data.message);
      }
    }
  };

  const handleResetOTP = async (values: any) => {
    try {
      const data = await resetOTP({
        ...values,
        username: selectedMerchant.sysUser.username,
      });
      if (data.success) {
        message.success(t.formatMessage({ id: 'messages.resetOtp' }));
        setOtpError('');
        setResetOTP(false);
        // fetchMerchantList();
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      if (error.data.code == 10110011) {
        setOtpError(t.formatMessage({ id: 'pages.login.incorrectOtp' }));
      } else {
        setOtpError(error.data.message);
      }
    }
  };

  const handleUpdateStatus = async (values: any, checked: boolean) => {
    const data = await updateAgentStatus({
      id: values.sysUser?.id,
      status: checked ? 'Enable' : 'Disable',
    });
    if (data.success) {
      // fetchMerchantList();
      message.success(t.formatMessage({ id: 'messages.savedStatus' }));
      tableRef?.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<ListItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.agentNo' })}</span>,
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.agent' }),
      dataIndex: ['sysUser', 'username'],
      order: 4,
      ellipsis: true,
      fieldProps: {
        maxLength: maxLength.NAME,
        placeholder: '',
      },
    },
    // {
    //   title: t.formatMessage({id: 'table.balance'}),
    //   dataIndex: 'balance',
    //   // valueType: 'money',
    //   // order: 4,
    // },
    // {
    //   title: t.formatMessage({id: 'table.merchantDepositRate'}),
    //   dataIndex: 'depositRate',
    //   // order: 4,
    // },
    // {
    //   title: t.formatMessage({id: 'table.withdrawalLimit'}),
    //   dataIndex: 'withdrawLimit',
    //   // valueType: 'money',
    //   // order: 4,
    // },
    // {
    //   title: t.formatMessage({id: 'table.depositLimit'}),
    //   dataIndex: 'depositLimit',
    //   // valueType: 'money',
    //   // order: 4,
    // },
    // {
    //   title: t.formatMessage({id: 'table.createdTime'}),
    //   dataIndex: 'createdTime',
    //   valueType: 'dateTime',
    //   order: 5,
    // },
    // {
    //   title: t.formatMessage({id: 'table.status'}),
    //   dataIndex: 'status',
    //   valueType: 'select',
    //   order: 3,
    //   valueEnum: {
    //     all: { text: 'All' },
    //     true: {
    //       text: 'True',
    //     },
    //     false: {
    //       text: 'False',
    //     },
    //   },

    // },
    {
      title: <span>{t.formatMessage({ id: 'table.time' })}</span>,
      dataIndex: 'createdAtRangedAt',
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
      title: <span>{t.formatMessage({ id: 'table.balance' })}</span>,
      dataIndex: 'balance',
      hideInSearch: true,
      render: (_, value) => {
        return (value.merchantFinance && value.merchantFinance.balance) || '0.00';
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.agentDepositRate' })}</span>,
      dataIndex: 'agentDepositRate',
      hideInSearch: true,
      render: (v) => `${v}%`,
    },

    {
      title: <span>{t.formatMessage({ id: 'table.withdrawalLimit' })}</span>,
      dataIndex: 'maxWithdrawalLimit',
      hideInSearch: true,
      // ellipsis: true,
      render: (dom, entity) => {
        return (
          <span>
            {entity.minWithdrawalLimit} - {entity.maxWithdrawalLimit}
          </span>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.depositLimit' })}</span>,
      dataIndex: 'maxDepositLimit',
      hideInSearch: true,
      // ellipsis: true,
      render: (dom, entity) => {
        return (
          <span>
            {entity.minDepositLimit} - {entity.maxDepositLimit}
          </span>
        );
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.createdBy' })}</span>,
      dataIndex: 'createdBy',
      hideInSearch: true,
      render: (_, value) => {
        return value.sysUser && value.sysUser.createdBy;
      },
    },
    {
      title: <span>{t.formatMessage({ id: 'table.createdTime' })}</span>,
      dataIndex: ['sysUser', 'createdTime'],
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.status' })}</span>,
      dataIndex: ['sysUser', 'status'],
      hideInTable: false,
      initialValue: 'All',
      width: '100px',
      render: (_, value) => {
        return (
          <Access
            accessible={access?.Agents.List.UpdateStatus}
            fallback={
              <Switch
                disabled
                checked={value.sysUser.status === 'Enable'}
                checkedChildren="&#10003;"
                unCheckedChildren="&#x2715;"
                onChange={(checked) => {
                  handleUpdateStatus(value, checked);
                }}
              />
            }
          >
            <Switch
              checked={value.sysUser.status === 'Enable'}
              onChange={(checked) => {
                handleUpdateStatus(value, checked);
              }}
            />
          </Access>
        );
      },
      valueType: 'select',
      valueEnum: statusEnums,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.action' })}</span>,
      dataIndex: 'action',
      hideInSearch: true,
      render: (_: any, value: any) => (
        <Space split="|" wrap>
          <Access
            key="link"
            accessible={access?.Agents.List.Edit}
            fallback={
              <a key="link" style={{ pointerEvents: 'none', color: '#ddd' }}>
                {t.formatMessage({ id: 'trxn.edit' })}
              </a>
            }
          >
            <a key="link" onClick={() => handleEditMerchant(value)}>
              {t.formatMessage({ id: 'trxn.edit' })}
            </a>
          </Access>
          <Access
            key="otp"
            accessible={access?.Agents.List.ResetOTP}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                key="otp"
                onClick={() => {
                  setResetOtpType('Login');
                  setSelectedMerchant(value);
                  showResetOTP(true);
                }}
              >
                {t.formatMessage({ id: 'modal.resetOTP1' })}
              </a>
            }
          >
            <a
              key="otp"
              onClick={() => {
                setResetOtpType('Login');
                setSelectedMerchant(value);
                showResetOTP(true);
              }}
            >
              {t.formatMessage({ id: 'modal.resetOTP1' })}
            </a>
          </Access>
          <Access
            key="otp"
            accessible={access?.Agents.List.ResetOTP}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                key="otp"
                onClick={() => {
                  setResetOtpType('Transaction');
                  setSelectedMerchant(value);
                  showResetOTP(true);
                }}
              >
                {t.formatMessage({ id: 'modal.resetOTP2' })}
              </a>
            }
          >
            <a
              key="otp"
              onClick={() => {
                setResetOtpType('Transaction');
                setSelectedMerchant(value);
                showResetOTP(true);
              }}
            >
              {t.formatMessage({ id: 'modal.resetOTP2' })}
            </a>
          </Access>
          <Access
            key="ip"
            accessible={access?.Agents.List.IPWhitelist}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                key="ip"
                onClick={() => {
                  setSelectedMerchant(value);
                  showIPAddress(true);
                }}
              >
                {t.formatMessage({ id: 'trxn.ipWhitelist' })}
              </a>
            }
          >
            <a
              key="ip"
              onClick={() => {
                setSelectedMerchant(value);
                showIPAddress(true);
              }}
            >
              {t.formatMessage({ id: 'trxn.ipWhitelist' })}
            </a>
          </Access>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setFlexToAuto(1);
  }, []);

  useEffect(() => {
    fetchDictionaryAgentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    if (!resetOTPModal) {
      setOtpError('');
    }
  }, [resetOTPModal]);

  useEffect(() => {
    if (!addMerchantModal) {
      setOtpError('');
      setEditMerchant({});
      form.resetFields();
    }
  }, [addMerchantModal, form]);

  useEffect(() => {
    const currMenuAccess = access?.Agents.List;
    const list = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(list.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('agent-list', filterRef);
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
        <AddNewMerchant
          title={modalTitle}
          form={form}
          values={editMerchant}
          visible={addMerchantModal}
          onCancel={() => setAddMerchantModal(false)}
          onCreate={(values) => handleAddMerchant(values)}
        />
        <ResetOTP
          title={
            resetOtpType === 'Login'
              ? t.formatMessage({ id: 'modal.resetOTP1' })
              : t.formatMessage({ id: 'modal.resetOTP2' })
          }
          type={resetOtpType}
          error={otpError}
          visible={resetOTPModal}
          onCancel={() => setResetOTP(false)}
          onCreate={(values: any) => handleResetOTP(values)}
        />
        <IPAddress
          ipAddress={(selectedMerchant.sysUser && selectedMerchant.sysUser.ipWhitelist) || ''}
          visible={ipAddressModal}
          onCancel={() => setIPAddress(false)}
          onCreate={(values) => handleUpdateWhitelist(values)}
        />
        <ProTable<ListItem, Pagination>
          actionRef={tableRef}
          className={styles.merchantTable}
          rowKey="key"
          cardBordered={true}
          formRef={filterRef}
          onSubmit={(v: any) => cookies.set(filterCookieMap['agent-list'], v, { path: '/' })}
          onReset={() => cookies.remove(filterCookieMap['agent-list'], { path: '/' })}
          pagination={paginationProps}
          request={handleFetchMerchantList}
          columns={
            access?.Agents.List['View(Ownonly)'] || access?.Agents.List['View(forAll)']
              ? columns
              : []
          }
          options={false}
          toolBarRender={() => [
            <Access
              key="add"
              accessible={access.Agents.List.Add}
              fallback={
                <Button disabled key="add" onClick={() => setAddMerchantModal(true)}>
                  {t.formatMessage({ id: 'table.add' })}
                </Button>
              }
            >
              <Button key="add" type="primary" onClick={() => setAddMerchantModal(true)}>
                {t.formatMessage({ id: 'table.add' })}
              </Button>
            </Access>,
            hasCopied && (
              <Alert
                className={styles.alertPopup}
                message={t.formatMessage({ id: 'trxn.copied' })}
                type="success"
                showIcon
                banner
              />
            ),
          ]}
          search={{
            onCollapse: (collapsed: boolean) => {
              if (collapsed) {
                setFlexToAuto(1);
              } else {
                setFlexToAuto(1, false);
              }
            },
          }}
        />
      </PageContainer>
    </Access>
  );
};

export default Merchants;
