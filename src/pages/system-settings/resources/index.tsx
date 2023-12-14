import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';

import { Access, useAccess, useIntl, useModel } from 'umi';

import { Button, Divider, notification, Result, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';

import type { ResourceItem, Pagination } from './data';
import { getResourceList, restoreResource, updateResource } from './service';
import AddResource from '@/components/System-settings/AddResources';
import EditResources from '@/components/System-settings/EditResources';
import styles from './style.less';
import { maxLength } from '@/global';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const Resource: FC = () => {
  const t = useIntl();
  const cookies = new Cookies();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { refresh } = useModel('@@initialState');
  const currentLang = localStorage.getItem('umi_locale') || 'en-US';

  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [addResourceModal, setAddResourceModal] = useState(false);
  const [editResourceModal, setResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState({} as ResourceItem);

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 20,
    // total: list.length,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  const showNotification = (notifMsg: string) => {
    notification.success({
      message: notifMsg,
      duration: 2,
    });
  };

  const showEditResources = (value: boolean) => {
    setResourceModal(value);
  };

  // const handleDeleteResource = async (_resource: ResourceItem) => {
  //   try {
  //     const data = await deleteResource({
  //       id: _resource.id,
  //     });

  //     if (data.success) {
  //       tableRef?.current?.reloadAndRest?.();
  //     }
  //   } catch (error: any) {
  //     message.error(error.data.message);
  //   }
  // };

  const fetchResourceList = async (values: any) => {
    const { name } = values;

    const filter: any = {
      // size,
      // page: page - 1,
      name,
    };

    const res = await getResourceList(filter);

    return res;
  };

  const handleUpdateResource = async (values: any) => {
    const data = await updateResource(values);

    if (data.success) {
      showNotification(t.formatMessage({ id: 'messages.saved' }));
      setResourceModal(false);
      refresh();
      tableRef?.current?.reloadAndRest?.();
    }
  };

  const handleRestoreResource = async () => {
    const data = await restoreResource();

    if (data.success) {
      showNotification(t.formatMessage({ id: 'messages.restore' }));
      refresh();
      tableRef?.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<ResourceItem>[] = [
    {
      title: t.formatMessage({ id: 'table.name' }),
      dataIndex: 'name',
      render: (dom) => {
        const data = JSON.parse(dom as string);
        return data[currentLang as string];
      },
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'table.type' }),
      dataIndex: 'type',
      search: false,
      render: (_, value) => {
        return t.formatMessage({ id: 'table.' + value.type });
      },
    },
    {
      title: t.formatMessage({ id: 'table.router' }),
      dataIndex: 'router',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.sort' }),
      dataIndex: 'sort',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'action',
      valueType: 'option',
      search: false,
      render: (_: any, value: ResourceItem) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Access
              accessible={access?.SystemSettings.Resources.Edit}
              fallback={
                <a
                  style={{ pointerEvents: 'none', color: '#ddd' }}
                  onClick={() => {
                    setSelectedResource(value);
                    showEditResources(true);
                  }}
                >
                  {t.formatMessage({ id: 'modal.edit' })}
                </a>
              }
            >
              <a
                onClick={() => {
                  setSelectedResource(value);
                  showEditResources(true);
                }}
              >
                {t.formatMessage({ id: 'modal.edit' })}
              </a>
            </Access>
            {/* <Access
              key="add"
              accessible={access?.SystemSettings.Resources.Delete}
              fallback={
                <Popconfirm
                  disabled
                  placement="topRight"
                  title={t.formatMessage({ id: 'modal.deleteResource' })}
                  okText={t.formatMessage({ id: 'modal.confirm' })}
                  onConfirm={() => handleDeleteResource(value)}
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
                title={t.formatMessage({ id: 'modal.deleteResource' })}
                okText={t.formatMessage({ id: 'modal.confirm' })}
                onConfirm={() => handleDeleteResource(value)}
                cancelText={t.formatMessage({ id: 'modal.cancel' })}
              >
                <a>{t.formatMessage({ id: 'modal.delete' })}</a>
              </Popconfirm>
            </Access> */}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    const currMenuAccess = access?.SystemSettings.Resources;
    const resource = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(resource.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('settings-resources', filterRef);
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
      <PageContainer title={false} className={styles.resourcesTable}>
        <AddResource
          onUpdate={(values: any) => handleUpdateResource(values)}
          resourceTitle={t.formatMessage({ id: 'modal.addresource' })}
          visible={addResourceModal}
          onCancel={() => setAddResourceModal(false)}
        />
        <EditResources
          resource={selectedResource}
          onUpdate={(values: any) => handleUpdateResource(values)}
          resourceTitle={t.formatMessage({ id: 'modal.editResources' })}
          visible={editResourceModal}
          onCancel={() => setResourceModal(false)}
        />

        <ProTable<ResourceItem, Pagination>
          actionRef={tableRef}
          rowKey="id"
          cardBordered={true}
          pagination={paginationProps}
          request={fetchResourceList}
          search={access?.SystemSettings.Resources.List}
          columns={access?.SystemSettings.Resources.List ? columns : []}
          options={false}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['settings-resources'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['settings-resources'], { path: '/' })}
          toolBarRender={() => [
            // <Access key="add" accessible={access?.SystemSettings.Resources.Add}>
            //   <Button type="primary" key="add" onClick={() => setAddResourceModal(true)}>
            //     {t.formatMessage({ id: 'modal.add' })}
            //   </Button>
            // </Access>,
            <Access key="restore" accessible={access?.SystemSettings.Resources.Restore}>
              <Button type="primary" key="restore" onClick={handleRestoreResource}>
                {t.formatMessage({ id: 'modal.restore' })}
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
    </Access>
  );
};

export default Resource;
