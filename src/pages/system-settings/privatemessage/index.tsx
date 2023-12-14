import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';

import { useModel, useIntl, Access, useAccess, getLocale } from 'umi';

import { Button, Divider, Space, Switch, Popconfirm, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { PrivatemsgItem, Pagination } from './data';
import { getAllMsg, deleteMsg, upadteMsg } from './service';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ComposeMessage from '@/components/System-settings/PrivateMessage';
import NotificationMsgBox from '../../../components/NotificationMsgBox/NotificationMsgBox';
import { fetchPrivateMessageStatusByDictionaryCode } from '../dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const PrivateMessage: FC = () => {
  const t = useIntl();
  const cookies = new Cookies();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const { currentUser }: any = initialState || {};

  const [title, setTitle] = useState('');
  const [modal, setModal] = useState(false);
  const [statusEnums, setStatusEnums] = useState({});
  const [currentRow, setCurrentRow] = useState(null);

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 10,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  const fetchDictionaryPrivateMessageStatus = async () => {
    const statusEnumValue = await fetchPrivateMessageStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Private_Message_Status_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const handleDeleteMsg = async (value: any) => {
    try {
      const data = await deleteMsg({
        id: value.id,
      });
      if (data.success) {
        message.success(t.formatMessage({ id: 'messages.deletePrivateMsg' }));
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const handleUpdateStatus = async (values: any, checked: boolean) => {
    const data = await upadteMsg({
      ...values,
      status: checked ? 'Enable' : 'Disable',
      sysUserId: currentUser?.id,
    });

    if (data.success) {
      message.success(t.formatMessage({ id: 'messages.updated' }));
      tableRef?.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<PrivatemsgItem>[] = [
    {
      title: t.formatMessage({ id: 'table.message' }),
      dataIndex: 'message',
      order: 4,
    },
    {
      title: t.formatMessage({ id: 'table.recipient' }),
      dataIndex: 'recipientType',
      valueType: 'select',
      order: 3,
      initialValue: 'All',
      valueEnum: {
        All: { text: t.formatMessage({ id: 'table.All' }) },
        'All Users': {
          text: t.formatMessage({ id: 'table.All Users' }),
        },
        'Selected Users': {
          text: t.formatMessage({ id: 'table.Selected Users' }),
        },
        'Selected Roles': {
          text: t.formatMessage({ id: 'table.Selected Roles' }),
        },
      },
      render: (data: any, value: any) => {
        return t.formatMessage({ id: 'table.' + value.recipientType });
      },
    },
    {
      title: t.formatMessage({ id: 'table.deliveredTime' }),
      dataIndex: 'deliveredTime',
      valueType: 'dateTime',
      order: 1,
    },
    {
      title: t.formatMessage({ id: 'table.sender' }),
      dataIndex: ['sysUser', 'username'],
      order: 0,
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'status',
      valueType: 'select',
      initialValue: 'All',
      order: 2,
      valueEnum: statusEnums,
      render: (_, value) => {
        return (
          <Switch
            checked={value.status === 'Enable'}
            checkedChildren="&#10003;"
            unCheckedChildren="&#x2715;"
            onChange={(checked) => {
              handleUpdateStatus(value, checked);
            }}
          />
        );
      },
    },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'id',
      hideInSearch: true,
      render: (_: any, value: any) => (
        // return (
        <Space split={<Divider type="vertical" />}>
          <a
            onClick={() => {
              setModal(true);
              setCurrentRow(value);
              setTitle(t.formatMessage({ id: 'modal.edit' }));
            }}
          >
            {t.formatMessage({ id: 'modal.edit' })}
          </a>
          <Popconfirm
            placement="topRight"
            title={t.formatMessage({ id: 'messages.confirmDelete' })}
            okText={t.formatMessage({ id: 'modal.confirm' })}
            onConfirm={() => handleDeleteMsg(value)}
            cancelText={t.formatMessage({ id: 'modal.cancel' })}
          >
            <a onClick={() => {}}>{t.formatMessage({ id: 'modal.delete' })}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const toolBar = [
    <Access key="add" accessible={access?.SystemSettings.PrivateMessages.Compose}>
      <Button
        type="primary"
        key="add"
        onClick={() => {
          setModal(true);
          setTitle(t.formatMessage({ id: 'modal.compose' }));
        }}
      >
        {t.formatMessage({ id: 'modal.compose' })}
      </Button>
    </Access>,
  ];

  useEffect(() => {
    fetchDictionaryPrivateMessageStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  const handleFetchMsgList = async (values: any, sort: any) => {
    const {
      pageSize: size,
      current: page,
      sysUser,
      deliveredTime,
      message: _message,
      createdBy,
      status,
      recipientType,
    } = values;
    const filter: any = {
      deliveredTime,
      size,
      page: page - 1,
      sort: sort && sort['sysUser,createdTime'] === 'ascend' ? 'Asc' : 'Desc',
      message: _message,
      recipient: recipientType,
      createdBy,
      status,
    };

    if (sysUser) {
      // filter.status = sysUser.status;
      filter.username = sysUser.username;
    }
    const response = await getAllMsg(filter);
    return response;
  };

  // const handleAddMsg = async (values: any) => {
  //   const {
  //     recipientType: recipientType,
  //     message: message,
  //     name: name, // recipient role name
  //     id: id, // edit
  //     userid: userid // recipient user id
  //   } = values;
  //   let role;
  //   const rolearray = [];
  //   if (recipientType == "Selected Roles") {
  //     for (var i = 0; i < name.length; i++) {
  //       const split = name[i].split("|");
  //       role = {
  //         name: split[1],
  //         type: recipientType,
  //         entityId: split[0]
  //       }
  //       rolearray.push(role)
  //     }
  //   } else if (recipientType == "Selected Users") {
  //     if (id) {
  //       for (var i = 0; i < id.length; i++) {
  //         const split = id[i].split("|");
  //         role = {
  //           id: split[0],
  //           name: split[1],
  //           type: recipientType,
  //         }
  //         rolearray.push(role)
  //       }
  //     } else if (userid) {
  //       for (var i = 0; i < userid.length; i++) {
  //         const split = userid[i].split("|");
  //         role = {
  //           id: split[0],
  //           name: split[1],
  //           type: recipientType,
  //         }
  //         rolearray.push(role)
  //       }
  //     }
  //   }

  //   const data = {
  //     recipientType: recipientType,
  //     message,
  //     messageRecipients: rolearray
  //   }
  //   const editdata = {
  //     recipientType: recipientType,
  //     message,
  //     messageRecipients: rolearray,
  //     status: msgData?.status,
  //     id: msgData?.id
  //   }

  //   try {
  //     if (title.includes('Edit') || title.includes('编辑')) {
  //       await upadteMsg(editdata as any);
  //       setModal(false);
  //       tableRef?.current?.reloadAndRest?.();
  //     } else {
  //       await addMsg(data as any);
  //       setModal(false);
  //       tableRef?.current?.reloadAndRest?.();
  //     }
  //   }
  //   catch (error: any) {
  //     message.error(error.data.message);
  //   }
  // }

  useEffect(() => {
    if (filterRef) {
      setFilters('settings-message', filterRef);
    }
  }, [filterRef]);

  return (
    <PageContainer title={false}>
      <NotificationMsgBox />
      <ComposeMessage
        title={title}
        visible={modal}
        close={() => {
          setModal(false);
          setCurrentRow(null);
        }}
        reloadTable={() => tableRef?.current?.reloadAndRest?.()}
        currentRow={currentRow}
      />

      <ProTable<PrivatemsgItem, Pagination>
        // dataSource={tableListDataSource}
        actionRef={tableRef}
        rowKey="key"
        cardBordered={true}
        pagination={paginationProps}
        request={handleFetchMsgList}
        columns={columns}
        options={false}
        formRef={filterRef}
        onSubmit={(v: any) => cookies.set(filterCookieMap['settings-message'], v, { path: '/' })}
        onReset={() => cookies.remove(filterCookieMap['settings-message'], { path: '/' })}
        toolBarRender={() => toolBar}
        search={{
          labelWidth: 110,
          defaultCollapsed: false,
          collapseRender: false,
        }}
      />
    </PageContainer>
  );
};

export default PrivateMessage;
