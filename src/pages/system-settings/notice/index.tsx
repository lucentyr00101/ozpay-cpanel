import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';

import { Access, useAccess, useIntl, useModel, getLocale } from 'umi';

import { Button, Divider, Space, Switch, Form, message, Popconfirm, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { NoticeItem, Pagination } from './data';
import type { ProColumns, ActionType } from '@ant-design/pro-table';

import NoticeModal from '@/components/System-settings/Notice';
import NotificationMsgBox from '../../../components/NotificationMsgBox/NotificationMsgBox';
import { getAllNotice, addNotice, upadteNotice, deleteNotice } from './service';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';

import { fetchStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const Notice: FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  const noticeRef = useRef();
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const { currentUser }: any = initialState || {};
  const selectedLang = getLocale();

  const [title, setTitle] = useState('');
  const [modal, setModal] = useState(false);
  const [noticeData, setNoticeData] = useState({});
  const [editModal, setEditModal] = useState({});
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [statusEnums, setStatusEnums] = useState({});

  const fetchDictionaryNoticeStatus = async () => {
    const statusEnumValue = await fetchStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Notice_Status,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const paginationProps = {
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  const handleUpdateStatus = async (values: any, checked: boolean) => {
    const data = await upadteNotice({
      ...values,
      status: checked ? 'Enable' : 'Disable',
      sysUserId: currentUser?.id,
    });

    if (data.success) {
      message.success(t.formatMessage({ id: 'messages.updated' }));
      noticeRef?.current.handleFetchNoticeList();
      tableRef?.current?.reloadAndRest?.();
    }
  };

  const handleDeleteNotice = async (value: any) => {
    try {
      const data = await deleteNotice({
        id: value.id,
      });
      if (data.success) {
        tableRef?.current?.reloadAndRest?.();
        noticeRef?.current.handleFetchNoticeList();
        message.success(t.formatMessage({ id: 'messages.deleteNotice' }));
      }
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const columns: ProColumns<NoticeItem>[] = [
    {
      title: t.formatMessage({ id: 'table.sort' }),
      dataIndex: 'sort',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.content' }),
      dataIndex: 'content',
      order: 4,
    },
    {
      title: t.formatMessage({ id: 'table.sender' }),
      dataIndex: ['sysUser', 'username'],
      order: 3,
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'status',
      valueType: 'select',
      initialValue: 'All',
      valueEnum: statusEnums,
      order: 2,
      render: (_, value) => {
        return (
          <Switch
            checkedChildren="&#10003;"
            unCheckedChildren="&#x2715;"
            checked={value.status === 'Enable'}
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
          <Access
            accessible={access?.SystemSettings.Notice.Edit}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                onClick={() => {
                  setEditModal(value);
                  setNoticeData(value);
                  setModal(true);
                  form.setFieldsValue(value);
                  setTitle(t.formatMessage({ id: 'modal.editNotice' }));
                }}
              >
                {t.formatMessage({ id: 'modal.edit' })}
              </a>
            }
          >
            <a
              onClick={() => {
                setEditModal(value);
                setNoticeData(value);
                setModal(true);
                form.setFieldsValue(value);
                setTitle(t.formatMessage({ id: 'modal.editNotice' }));
              }}
            >
              {t.formatMessage({ id: 'modal.edit' })}
            </a>
          </Access>
          <Access
            accessible={access?.SystemSettings.Notice.Delete}
            fallback={
              <Popconfirm
                disabled
                placement="topRight"
                title={t.formatMessage({ id: 'messages.confirmDelete' })}
                okText={t.formatMessage({ id: 'modal.confirm' })}
                onConfirm={() => handleDeleteNotice(value)}
                cancelText={t.formatMessage({ id: 'modal.cancel' })}
              >
                <a style={{ pointerEvents: 'none', color: '#ddd' }} onClick={() => {}}>
                  {t.formatMessage({ id: 'modal.delete' })}
                </a>
              </Popconfirm>
            }
          >
            <Popconfirm
              placement="topRight"
              title={t.formatMessage({ id: 'messages.confirmDelete' })}
              okText={t.formatMessage({ id: 'modal.confirm' })}
              onConfirm={() => handleDeleteNotice(value)}
              cancelText={t.formatMessage({ id: 'modal.cancel' })}
            >
              <a onClick={() => {}}>{t.formatMessage({ id: 'modal.delete' })}</a>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const toolBar = [
    <Access key="add" accessible={access?.SystemSettings.Notice.Add}>
      <Button
        type="primary"
        key="add"
        onClick={() => {
          setModal(true);
          setTitle(t.formatMessage({ id: 'modal.addNotice' }));
        }}
      >
        {t.formatMessage({ id: 'modal.add' })}
      </Button>
    </Access>,
  ];

  const handleFetchNoticeList = async (values: any) => {
    const { pageSize: size, current: page, sysUser, content, status } = values;
    const statusMap = {
      Enabled: 'Enable',
      Disabled: 'Disable',
      All: 'All',
    };
    const filter: any = {
      size,
      page: page - 1,
      status: statusMap[status],
      sort: 'Asc',
      content,
    };
    if (sysUser) {
      filter.createdBy = sysUser.username;
    }
    const response = await getAllNotice(filter);
    return response;
  };

  const handleAddNotice = async (values: any) => {
    const {
      sort: sort,
      content: content,
      // status: noticeData?.status,
      // id: noticeData?.id,
    } = values;
    const data = { sysUserId: currentUser?.id, sort, content };
    const editdata = {
      sysUserId: currentUser?.id,
      sort,
      content,
      status: noticeData?.status,
      id: noticeData?.id,
    };
    try {
      if (title.includes('Edit') || title.includes('编辑')) {
        await upadteNotice(editdata as any);
        setModal(false);
        tableRef?.current?.reloadAndRest?.();
        message.success(t.formatMessage({ id: 'messages.editNotice' }));
        noticeRef?.current.handleFetchNoticeList();
      } else {
        await addNotice(data as any);
        setModal(false);
        tableRef?.current?.reloadAndRest?.();
        message.success(t.formatMessage({ id: 'messages.addNotice' }));
        noticeRef?.current.handleFetchNoticeList();
      }
    } catch (error: any) {
      if (error.data.code === 205002) {
        return message.error(t.formatMessage({ id: 'messages.sortExist' }));
      }
      message.error(error?.data?.message || 'Something went wrong.');
      tableRef?.current?.reloadAndRest?.();
    }
  };

  useEffect(() => {
    if (!modal) {
      setEditModal({});
      form.resetFields();
    }
  }, [modal, form]);

  useEffect(() => {
    const currMenuAccess = access?.MemberTransaction.Withdrawal;
    const withdrawal = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(withdrawal.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDictionaryNoticeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    if (filterRef) {
      setFilters('settings-notice', filterRef);
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
        <NotificationMsgBox ref={noticeRef} />
        <NoticeModal
          title={title}
          form={form}
          values={editModal}
          visible={modal}
          onCancel={() => setModal(false)}
          onCreate={(values) => handleAddNotice(values)}
        />

        <ProTable<NoticeItem, Pagination>
          actionRef={tableRef}
          rowKey="key"
          cardBordered={true}
          pagination={paginationProps}
          request={handleFetchNoticeList}
          columns={columns}
          options={false}
          toolBarRender={() => toolBar}
          formRef={filterRef}
          onSubmit={(v: any) => cookies.set(filterCookieMap['settings-notice'], v, { path: '/' })}
          onReset={() => cookies.remove(filterCookieMap['settings-notice'], { path: '/' })}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
            collapseRender: false,
          }}
        />
      </PageContainer>
    </Access>
  );
};

export default Notice;
