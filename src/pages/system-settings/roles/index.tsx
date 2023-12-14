import type { FC } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { Button, Divider, Switch, Space, Result, notification, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { RoleItem, Pagination } from './data';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { addRole, getRoleList, updateRole, deleteRole } from './service';
import { resourceTree } from '../resources/service';
import Popconfirm from 'antd/lib/popconfirm';
import RoleModal from '@/components/System-settings/Role';
import SetPermission from '@/components/System-settings/SetPermission';
import { Access, useAccess, useIntl, useModel } from 'umi';

const Role: FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const { refresh } = useModel('@@initialState');

  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState({} as RoleItem);
  const [roleTitle, setRoleTitle] = useState('');
  const [editRoleModal, setRoleModal] = useState(false);
  const [permissionModal, setPermissionModal] = useState(false);
  const [resources, setResources] = useState([]);

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

  const showEditRole = (value: boolean) => {
    setRoleModal(value);
  };
  const showPermission = (value: boolean) => {
    setPermissionModal(value);
  };

  const showNotification = (_message: string) => {
    notification.success({
      message: _message,
      duration: 2,
    });
  };

  const handleUpdateStatus = async (_role: any, checked: boolean) => {
    try {
      const data = await updateRole({
        id: _role.id,
        name: _role.name,
        code: _role.code,
        sort: _role.sort,
        remark: _role.remark,
        status: checked ? 'Enable' : 'Disable',
        sysResources: [..._role.sysResources.map((permission: any) => permission.id)],
        sysResourceChecks: [..._role.sysResourceChecks.map((permission: any) => permission.id)],
      });

      if (data.success) {
        showNotification(t.formatMessage({ id: 'messages.saved' }));
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const handleAddRole = async (values: any, isEditing: boolean) => {
    try {
      let data = { success: false };
      console.log(values);
      if (isEditing) {
        data = await updateRole({
          ...values,
          id: selectedRole.id,
        });
      } else {
        data = await addRole(values);
      }

      if (data.success) {
        showNotification(t.formatMessage({ id: 'messages.saved' }));
        setRoleModal(false);
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      if (error?.data.code == 2019003) {
        message.error(t.formatMessage({ id: 'messages.roleNameExist' }));
      } else if (error?.data.code == 2019005) {
        message.error(t.formatMessage({ id: 'messages.sortExist' }));
      } else if (error?.data.code == 2019002) {
        message.error(t.formatMessage({ id: 'messages.roleCodeExist' }));
      } else {
        message.error(error?.data?.message || 'Something went wrong');
      }
    }
  };

  const handleDeleteRole = async (_role: RoleItem) => {
    try {
      const data = await deleteRole({
        id: _role.id,
      });

      if (data.success) {
        showNotification(t.formatMessage({ id: 'messages.deleted' }));
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const fetchRolesList = async (values: any) => {
    const { username, createdAtRange, pageSize: size, current: page } = values;
    const filter: any = {
      size,
      page: page - 1,
      merchantUsername: username,
    };

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const data = await getRoleList(filter);

    return data;
  };

  const handleCheckedPermissions = async (sysResources: any, halfCheckedKeys: any) => {
    try {
      const data = await updateRole({
        id: selectedRole.id,
        name: selectedRole.name,
        code: selectedRole.code,
        sort: selectedRole.sort,
        remark: selectedRole.remark,
        status: selectedRole.status,
        sysResources: sysResources,
        sysResourceChecks: halfCheckedKeys,
      });

      if (data.success) {
        showNotification(t.formatMessage({ id: 'messages.saved' }));
        tableRef?.current?.reloadAndRest?.();
        refresh();
        setPermissionModal(false);
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const columns: ProColumns<RoleItem>[] = [
    {
      title: t.formatMessage({ id: 'table.name' }),
      dataIndex: 'name',
      ellipsis: true,
      order: 4,
    },
    {
      title: t.formatMessage({ id: 'table.code' }),
      dataIndex: 'code',
      ellipsis: true,
      order: 3,
    },
    {
      title: t.formatMessage({ id: 'table.sort' }),
      dataIndex: 'sort',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'status',
      search: false,
      render: (_, value) => {
        return (
          <Access
            accessible={access.SystemSettings.Roles.UpdateStatus}
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
      title: t.formatMessage({ id: 'table.remarks' }),
      dataIndex: 'remark',
      ellipsis: true,
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'action',
      valueType: 'option',
      width: 200,
      search: false,
      render: (_: any, value: RoleItem) => (
        <Space split={<Divider type="vertical" />}>
          <Access
            accessible={access.SystemSettings.Roles.Edit}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                onClick={() => {
                  setSelectedRole(value);
                  showEditRole(true);
                  setRoleTitle(t.formatMessage({ id: 'modal.editRole' }));
                }}
              >
                {t.formatMessage({ id: 'modal.edit' })}
              </a>
            }
          >
            <a
              onClick={() => {
                setSelectedRole(value);
                showEditRole(true);
                setRoleTitle(t.formatMessage({ id: 'modal.editRole' }));
              }}
            >
              {t.formatMessage({ id: 'modal.edit' })}
            </a>
          </Access>
          <Access
            accessible={true}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                onClick={() => {
                  setSelectedRole(value);
                  console.log({ value });
                  showPermission(true);
                }}
              >
                {t.formatMessage({ id: 'modal.setPermission' })}
              </a>
            }
          >
            <a
              onClick={() => {
                setSelectedRole(value);
                showPermission(true);
              }}
            >
              {t.formatMessage({ id: 'modal.setPermission' })}
            </a>
          </Access>
          <Access
            accessible={access.SystemSettings.Roles.Delete}
            fallback={
              <Popconfirm
                disabled
                placement="topRight"
                title={t.formatMessage({ id: 'modal.deleteRole' })}
                okText={t.formatMessage({ id: 'modal.confirm' })}
                onConfirm={() => handleDeleteRole(value)}
                cancelText={t.formatMessage({ id: 'modal.cancel' })}
              >
                <a style={{ pointerEvents: 'none', color: '#ddd' }}>
                  {t.formatMessage({ id: 'modal.delete' })}
                </a>
              </Popconfirm>
            }
          >
            <Popconfirm
              placement="topRight"
              title={t.formatMessage({ id: 'modal.deleteRole' })}
              okText={t.formatMessage({ id: 'modal.confirm' })}
              onConfirm={() => handleDeleteRole(value)}
              cancelText={t.formatMessage({ id: 'modal.cancel' })}
            >
              <a>{t.formatMessage({ id: 'modal.delete' })}</a>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    async function getData() {
      const { data } = await resourceTree();
      setResources(data);
    }

    getData();
  }, []);

  useEffect(() => {
    const currMenuAccess = access?.SystemSettings.Roles;
    const roles = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(roles.length > 0);
  }, []);

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
        <RoleModal
          role={selectedRole}
          roleTitle={roleTitle}
          visible={editRoleModal}
          onCancel={() => setRoleModal(false)}
          onCreate={(values, isEditing) => handleAddRole(values, isEditing)}
        />
        <SetPermission
          visible={permissionModal}
          permissionData={resources}
          existingKeys={selectedRole.sysResources?.map((item) => item.id) || []}
          onHandleCheckedPermissions={(_checkedKeys: any, halfCheckedKeys: any) =>
            handleCheckedPermissions(_checkedKeys, halfCheckedKeys)
          }
          onCancel={() => setPermissionModal(false)}
        />
        <ProTable<RoleItem, Pagination>
          actionRef={tableRef}
          rowKey="key"
          cardBordered={true}
          search={false}
          pagination={paginationProps}
          request={fetchRolesList}
          columns={columns}
          options={false}
          toolBarRender={() => [
            <Access key="add" accessible={access.SystemSettings.Roles.Add}>
              <Button
                type="primary"
                key="add"
                onClick={() => {
                  showEditRole(true);
                  setRoleTitle(t.formatMessage({ id: 'modal.addRole' }));
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

export default Role;
