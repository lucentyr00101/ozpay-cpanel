import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import { Button, Divider, Switch, Space, Result, message, Form } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { UserItem, Pagination } from './data';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ResetOTP from '@/components/Merchant/ResetOTP';
import IPAddress from '@/components/Merchant/IPAddress';
import UserModal from '@/components/System-settings/User';
import { Access, getLocale, useAccess, useIntl, useModel } from 'umi';
import { addUser, resetOTP, updateUser, updateWhitelist, fetchUsersSearch } from './service';
import styles from './style.less';
import { getRoleAll } from '../roles/service';
import { maxLength } from '@/global';
import {
  fetchMerchantMemberStatusByDictionaryCode,
  fetchUserTypeByDictionaryCode,
} from '../dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
// import moment from 'moment';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const User: FC = () => {
  const t = useIntl();
  const selectedLang = getLocale();
  const cookies = new Cookies();
  const access: any = useAccess();
  const [form] = Form.useForm();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { refresh } = useModel('@@initialState');

  const [roles, setRoles] = useState({});
  const [userTypeEnums, setUserTypeEnums] = useState({});
  const [otpError, setOtpError] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState({} as UserItem);
  const [editUserModal, setUserModal] = useState(false);
  const [resetOTPModal, setResetOTP] = useState(false);
  const [ipAddressModal, setIPAddress] = useState(false);
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [totalDataLength, setTotalDataLength] = useState(100);
  const [statusEnums, setStatusEnums] = useState({});
  const [resetOtpType, setResetOtpType] = useState('');

  const fetchDictionaryUserStatus = async () => {
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
    total: totalDataLength,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  const fetchUserTypeStatus = async () => {
    const statusEnumValue = await fetchUserTypeByDictionaryCode(
      DICTIONARY_TYPE_CODE.User_Type_Code,
      selectedLang,
    );
    setUserTypeEnums(statusEnumValue);
  };

  const fetchRoles = async () => {
    const { data } = await getRoleAll();
    const getRoles = data.reduce((prev, curr: any) => {
      prev[curr.id] = curr.name;

      return prev;
    }, {});

    const filteredAddAllRoles = { All: 'All', ...getRoles };
    setRoles(filteredAddAllRoles);
  };

  const showEditUser = async (value: boolean) => {
    setUserModal(value);
  };
  const showResetOTP = (value: boolean) => {
    setResetOTP(value);
  };
  const showIPAddress = (value: boolean) => {
    setIPAddress(value);
  };
  const handleEdit = (value: any) => {
    const _user = {
      ...value,
      grantedRoles: (value?.grantedRoles && value?.grantedRoles.map((role: any) => role.id)) || [],
    };
    showEditUser(true);
    setSelectedUser(_user);
    form.setFieldsValue(_user);
    setUserTitle(t.formatMessage({ id: 'modal.editUser' }));
  };

  const handleUpdateWhitelist = async (values: any) => {
    try {
      console.log(values);
      const data = await updateWhitelist({ ipWhitelist: values.ipAddress, id: selectedUser.id });
      if (data.success) {
        setIPAddress(false);
        tableRef?.current?.reloadAndRest?.();
        message.success(t.formatMessage({ id: 'messages.updateIP' }));
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const handleResetOTP = async (values: any) => {
    try {
      const data = await resetOTP({
        ...values,
        username: selectedUser.username,
      });
      if (data.success) {
        message.success(t.formatMessage({ id: 'messages.resetOtp' }));
        setResetOTP(false);
        setOtpError('');
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

  // const fetchUserList = async () => {
  //   setTableLoading(true);
  //   const { data: userList } = await getUserList();
  //   // setUsers(userList as any);
  //   setFilteredUsers(userList as any);
  //   setTableLoading(false);
  // };

  // const handleFilters = async (filters: any) => {
  //   setUsersFilter(filters);

  //   if (filters.username || filters.time) {
  //     setFilteredUsers(
  //       users.filter((user: any) => {
  //         const { username, time } = filters;
  //         const [dateStart, dateEnd] = time;
  //         const dateCreated = moment(user.createdTime);
  //         return (
  //           (username && user.username.toLowerCase().includes(username.toLowerCase())) ||
  //           moment(dateCreated).isBetween(dateStart, moment(dateEnd).add(1, 'days'))
  //         );
  //       }),
  //     );
  //   } else {
  //     setFilteredUsers(users);
  //   }
  // };

  const handleFetchSysUsers = async (values: any, sort: any) => {
    setTableLoading(true);
    const {
      time,
      pageSize: size,
      current: page,
      username,
      status,
      userType,
      grantedRoles,
    } = values;
    const filter: any = {
      size,
      page: page - 1,
      username,
      status,
      userType,
      roleId: grantedRoles === 'All' ? undefined : grantedRoles,
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (Object.keys(roles).length === 0) {
      await fetchRoles();
    }

    if (time) {
      const [fromDate, toDate] = time;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const response = fetchUsersSearch(filter);
    const data: any = await response;
    setTableLoading(false);
    setFilteredUsers(data.data as any);
    setTotalDataLength(data.totalElements);

    return response;
  };

  const handleAddUser = async (values: any, isEditing: boolean) => {
    try {
      let data = { success: false };
      if (isEditing) {
        data = await updateUser({
          ...values,
          id: selectedUser.id,
        });
      } else {
        data = await addUser(values);
      }

      if (data.success) {
        if (isEditing) {
          message.success(t.formatMessage({ id: 'messages.editUser' }));
        } else {
          message.success(t.formatMessage({ id: 'messages.addUser' }));
        }
        // done add or edit, refresh the initialState
        refresh();
        setUserModal(false);
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const handleUpdateStatus = async (user: any, checked: boolean) => {
    try {
      const data = await updateUser({
        id: user.id,
        username: user.username,
        userType: user.userType,
        grantedRoles: (user.grantedRoles && user.grantedRoles.map((item: any) => item.id)) || [],
        status: checked ? 'Enable' : 'Disable',
      });
      if (data.success) {
        message.success(t.formatMessage({ id: 'messages.savedStatus' }));
        setIPAddress(false);
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  // useEffect(() => {
  //   fetchRoles()
  //   fetchUserList();
  // }, []);

  const columns: ProColumns<UserItem>[] = [
    {
      title: t.formatMessage({ id: 'table.time' }),
      dataIndex: 'time',
      valueType: 'dateTimeRange',
      order: 5,
      hideInTable: true,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
    {
      title: t.formatMessage({ id: 'table.userName' }),
      dataIndex: 'username',
      order: 4,
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'table.userType' }),
      dataIndex: 'userType',
      valueType: 'select',
      order: 2,
      valueEnum: userTypeEnums,
      initialValue: 'All',
      render: (_, value) => {
        return t.formatMessage({ id: 'table.' + value.userType });
      },
    },
    {
      title: t.formatMessage({ id: 'table.roles' }),
      dataIndex: 'grantedRoles',
      valueEnum: roles,
      order: 1,
      initialValue: 'All',
      // fieldProps:{
      //   mode: 'tags',
      // },
      render: (_, value) => {
        // console.log("_roles", value);
        return (
          value &&
          Array.isArray(value.grantedRoles) &&
          value.grantedRoles.map((item: any) => item.name).join(', ')
        );
      },
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'status',
      valueType: 'select',
      initialValue: 'All',
      order: 3,
      valueEnum: statusEnums,
      render: (_, value) => {
        return (
          <Access
            accessible={access?.SystemSettings.Users.UpdateStatus}
            fallback={
              <Switch
                disabled
                checked={value.status === 'Enable'}
                checkedChildren="&#10003;"
                unCheckedChildren="&#x2715;"
                onChange={(checked) => {
                  handleUpdateStatus(value, checked);
                }}
              />
            }
          >
            <Switch
              checked={value.status === 'Enable'}
              checkedChildren="&#10003;"
              unCheckedChildren="&#x2715;"
              onChange={(checked) => {
                handleUpdateStatus(value, checked);
              }}
            />
          </Access>
        );
      },
    },
    {
      title: t.formatMessage({ id: 'table.createdTime' }),
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: t.formatMessage({ id: 'table.createdBy' }),
      dataIndex: 'createdBy',
      search: false,
    },
    // {
    //   title: t.formatMessage({ id: 'table.remarks' }),
    //   dataIndex: 'remarks',
    //   search: false,
    // },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'action',
      valueType: 'option',
      search: false,
      render: (_: any, value: any) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Access
              accessible={access?.SystemSettings.Users.Edit}
              fallback={
                <a
                  style={{ pointerEvents: 'none', color: '#ddd' }}
                  onClick={() => handleEdit(value)}
                >
                  {t.formatMessage({ id: 'modal.edit' })}
                </a>
              }
            >
              <a onClick={() => handleEdit(value)}>{t.formatMessage({ id: 'modal.edit' })}</a>
            </Access>
            <Access
              accessible={access?.SystemSettings.Users.ResetOTP}
              fallback={
                <a
                  style={{ pointerEvents: 'none', color: '#ddd' }}
                  onClick={() => {
                    setResetOtpType('Login');
                    setSelectedUser(value);
                    showResetOTP(true);
                  }}
                >
                  {t.formatMessage({ id: 'modal.resetOTP1' })}
                </a>
              }
            >
              <a
                onClick={() => {
                  setResetOtpType('Login');
                  setSelectedUser(value);
                  showResetOTP(true);
                }}
              >
                {t.formatMessage({ id: 'modal.resetOTP1' })}
              </a>
            </Access>
            <Access
              accessible={access?.SystemSettings.Users.ResetOTP}
              fallback={
                <a
                  style={{ pointerEvents: 'none', color: '#ddd' }}
                  onClick={() => {
                    setResetOtpType('Transaction');
                    setSelectedUser(value);
                    showResetOTP(true);
                  }}
                >
                  {t.formatMessage({ id: 'modal.resetOTP2' })}
                </a>
              }
            >
              <a
                onClick={() => {
                  setResetOtpType('Transaction');
                  setSelectedUser(value);
                  showResetOTP(true);
                }}
              >
                {t.formatMessage({ id: 'modal.resetOTP2' })}
              </a>
            </Access>
            <Access
              accessible={access?.SystemSettings.Users.ResetOTP}
              fallback={
                <a
                  style={{ pointerEvents: 'none', color: '#ddd' }}
                  onClick={() => {
                    console.log(value);
                    setSelectedUser(value);
                    showIPAddress(true);
                  }}
                >
                  {t.formatMessage({ id: 'modal.ipWhitelist' })}
                </a>
              }
            >
              <a
                onClick={() => {
                  console.log(value);
                  setSelectedUser(value);
                  showIPAddress(true);
                }}
              >
                {t.formatMessage({ id: 'modal.ipWhitelist' })}
              </a>
            </Access>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    if (!resetOTPModal) {
      setOtpError('');
    }
  }, [resetOTPModal]);

  useEffect(() => {
    if (!editUserModal) {
      setSelectedUser({} as UserItem);
      form.resetFields();
    }
  }, [editUserModal, form]);

  useEffect(() => {
    const currMenuAccess = access?.SystemSettings.Users;
    const users = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(users.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserTypeStatus();
    fetchDictionaryUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    if (filterRef) {
      setFilters('settings-users', filterRef);
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
      <PageContainer title={false} className={styles.usersTable}>
        <UserModal
          form={form}
          userTitle={userTitle}
          visible={editUserModal}
          roles={roles}
          user={selectedUser}
          onCancel={() => setUserModal(false)}
          onCreate={(values, isEditing) => handleAddUser(values, isEditing)}
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
          ipAddress={selectedUser.ipWhitelist}
          visible={ipAddressModal}
          onCancel={() => setIPAddress(false)}
          onCreate={(values) => handleUpdateWhitelist(values)}
        />
        <ProTable<UserItem, Pagination>
          actionRef={tableRef}
          loading={tableLoading}
          pagination={paginationProps}
          rowKey="id"
          cardBordered={true}
          request={handleFetchSysUsers}
          formRef={filterRef}
          onSubmit={(v: any) => cookies.set(filterCookieMap['settings-users'], v, { path: '/' })}
          onReset={() => cookies.remove(filterCookieMap['settings-users'], { path: '/' })}
          dataSource={filteredUsers}
          search={access?.SystemSettings.Users.List && { labelWidth: 80 }}
          columns={access?.SystemSettings.Users.List ? columns : []}
          options={false}
          toolBarRender={() => [
            <Access key="add" accessible={access?.SystemSettings.Users.Add}>
              <Button
                type="primary"
                key="add"
                onClick={() => {
                  showEditUser(true);
                  setUserTitle(t.formatMessage({ id: 'modal.addUser' }));
                }}
              >
                {t.formatMessage({ id: 'modal.add' })}
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
    </Access>
  );
};

export default User;
