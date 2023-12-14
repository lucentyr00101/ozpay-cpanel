import type { FC, Key } from 'react';
import { useEffect } from 'react';
import { useState, useRef } from 'react';

import { Access, getLocale, useAccess, useIntl } from 'umi';

import { Result, Switch, message } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';

import type { MemberItem, Pagination } from './data';
import { getMemberList, resetPasswordMember, updateMember } from './service';

import { maxLength } from '@/global';
import styles from './style.less';
import ResetPassword from '@/components/Member/ResetPassword';
import { fetchMerchantMemberStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';
import Cookies from 'universal-cookie';

export interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected?: () => void;
  startEditable: (rowKey: Key) => boolean;
  cancelEditable: (rowKey: Key) => boolean;
}

const Members: FC = () => {
  const t = useIntl();
  const cookies = new Cookies();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const tableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();

  const [statusEnums, setStatusEnums] = useState({});
  const [tableLoading, setTableLoading] = useState(false);
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [resetPasswordModal, setResetPassword] = useState(false);
  const [selectedMember, setSelectedMember] = useState({} as MemberItem);

  const showResetPassword = (value: boolean) => {
    setResetPassword(value);
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

  const fetchDictionaryMemberStatus = async () => {
    const statusEnumValue = await fetchMerchantMemberStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Merchant_Member_Status_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const fetchMemberList = async (values: any, sort: any) => {
    const { username, status, createdAtRange, pageSize: size, current: page } = values;
    const filter: any = {
      size,
      page: page - 1,
      username,
      ...(status && { status }),
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const data = await getMemberList(filter);

    return data;
  };

  const handleUpdateStatus = async (member: any, checked: boolean) => {
    setTableLoading(true);
    const data = await updateMember({
      ...member,
      status: checked ? 'Enable' : 'Disable',
    });
    if (data.success) {
      setTableLoading(false);
      message.success(t.formatMessage({ id: 'messages.savedStatus' }));
      tableRef?.current?.reloadAndRest();
    }
  };

  const handleResetPassword = async (values: any) => {
    try {
      const data = await resetPasswordMember({
        id: selectedMember.id,
        password: values.password,
      });

      if (data.success) {
        message.success(t.formatMessage({ id: 'messages.resetPw' }));
        showResetPassword(false);
      }
    } catch (error) {
      message.error(error.data.message);
    }
  };

  const columns: ProColumns<MemberItem>[] = [
    {
      title: t.formatMessage({ id: 'table.time' }),
      dataIndex: 'createdAtRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      order: 3,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
    {
      title: t.formatMessage({ id: 'table.merchant' }),
      dataIndex: 'merchantUsername',
      ellipsis: true,
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.member' }),
      dataIndex: 'username',
      ellipsis: true,
      order: 2,
      fieldProps: {
        placeholder: t.formatMessage({ id: 'table.userName' }),
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'table.createdBy' }),
      dataIndex: 'createdBy',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.createdTime' }),
      dataIndex: 'createdTime',
      hideInSearch: true,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'status',
      hideInTable: false,
      order: 1,
      fieldProps: {
        placeholder: 'Status',
      },
      initialValue: 'All',
      valueEnum: statusEnums,
      render: (_, value) => {
        return (
          <Access
            accessible={access.Member.MemberList.UpdateStatus}
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
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'action',
      hideInSearch: true,
      render: (_, values: any) => [
        <Access
          key="edit"
          accessible={access.Member.MemberList.ResetPassword}
          fallback={
            <a
              key="edit"
              style={{ pointerEvents: 'none', color: '#ddd' }}
              onClick={showResetPassword}
            >
              {t.formatMessage({ id: 'modal.resetPassword' })}{' '}
            </a>
          }
        >
          <a
            key="edit"
            onClick={() => {
              showResetPassword(true);
              setSelectedMember(values);
            }}
          >
            {t.formatMessage({ id: 'modal.resetPassword' })}
          </a>
        </Access>,
      ],
    },
  ];

  useEffect(() => {
    fetchDictionaryMemberStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    const currMenuAccess = access?.Member.MemberList;
    const memberList = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(memberList.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('member-list', filterRef);
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
        <ProTable<MemberItem, Pagination>
          actionRef={tableRef}
          formRef={filterRef}
          className={styles.memberTable}
          loading={tableLoading}
          onSubmit={(v: any) => cookies.set(filterCookieMap['member-list'], v, { path: '/' })}
          onReset={() => cookies.remove(filterCookieMap['member-list'], { path: '/' })}
          rowKey="id"
          cardBordered={true}
          pagination={paginationProps}
          request={fetchMemberList}
          search={
            access?.Member.MemberList['View(Ownonly)'] || access?.Member.MemberList['View(forAll)']
          }
          columns={
            access?.Member.MemberList['View(Ownonly)'] || access?.Member.MemberList['View(forAll)']
              ? columns
              : []
          }
          options={false}
        />

        <ResetPassword
          visible={resetPasswordModal}
          onCancel={() => setResetPassword(false)}
          onCreate={(values: any) => handleResetPassword(values)}
        />
      </PageContainer>
    </Access>
  );
};

export default Members;
