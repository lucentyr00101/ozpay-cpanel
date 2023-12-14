/* eslint-disable react/jsx-key */
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, Result, Switch, notification, message, Avatar } from 'antd';
import type { PaymentTypeItem, Pagination } from '../../shared/fiat-payment-type/data';
import {
  deletePaymentType,
  updatePaymentType,
  getFiatPaymentTypeList,
} from '../../shared/fiat-payment-type/service';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import styles from '../../shared/fiat-payment-type/style.less';
import { Access, useAccess, useIntl } from 'umi';
import AddPaymentType from '@/components/Transactions/PaymentTypes/Add';
import EditPaymentType from '@/components/Transactions/PaymentTypes/Edit';

const PaymentType: FC = () => {
  const t = useIntl();
  const access: any = useAccess();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<PaymentTypeItem | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const tableRef = useRef<ActionType>();

  const showNotification = (notifMsg: string) => {
    notification.success({
      message: notifMsg,
      duration: 2,
    });
  };

  const handleDeletePaymentType = async (value: any) => {
    try {
      await deletePaymentType({ id: value.id });
      showNotification(t.formatMessage({ id: 'messages.deleted' }));
      tableRef?.current?.reloadAndRest?.();
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const handleEdit = (row: PaymentTypeItem) => {
    setShowEdit(true);
    setCurrentRow(row);
  };

  const handleToggleStatus = async (row: PaymentTypeItem) => {
    setTableLoading(true);
    try {
      const newForm = new FormData();
      newForm.set(
        'paymentTypeUpdateParam',
        new Blob(
          [
            JSON.stringify({
              ...row,
              status: row.status === 'Enable' ? 'Disable' : 'Enable',
            }),
          ],
          { type: 'application/json' },
        ),
      );
      await updatePaymentType(newForm);
      message.success(t.formatMessage({ id: 'messages.savedStatus' }));
    } catch (e: any) {
      if (e?.data?.code == 2010007) {
        message.error(t.formatMessage({ id: 'messages.paymentTypeStatusFail' }));
      } else {
        message.error(e?.data?.message || 'Something went wrong.');
      }
    } finally {
      tableRef?.current?.reloadAndRest?.();
      setTableLoading(false);
    }
  };

  const columns: ProColumns<PaymentTypeItem>[] = [
    {
      title: t.formatMessage({ id: 'table.logo' }),
      dataIndex: 'logo',
      className: 'avatar-custom',
      render: (value) => <Avatar src={value} />,
    },
    {
      title: t.formatMessage({ id: 'table.name' }),
      dataIndex: 'name',
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'avatar',
      render: (_, row: PaymentTypeItem) => {
        return (
          <Access
            accessible={access?.MemberTransaction?.FiatPaymentType.UpdateStatus}
            fallback={
              <Switch
                disabled
                checkedChildren="&#10003;"
                unCheckedChildren="&#x2715;"
                checked={row.status === 'Enable'}
              />
            }
          >
            <Switch
              checkedChildren="&#10003;"
              unCheckedChildren="&#x2715;"
              checked={row.status === 'Enable'}
              onChange={() => handleToggleStatus(row)}
            />
          </Access>
        );
      },
    },
    {
      title: t.formatMessage({ id: 'table.tag' }),
      dataIndex: 'tag',
    },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, row: any) => [
        <Access
          accessible={access?.MemberTransaction?.FiatPaymentType.Edit}
          fallback={
            <a key="edit" 
            style={{ pointerEvents: 'none', color: '#ddd' }} 
            onClick={() => handleEdit(row)}>
              {t.formatMessage({ id: 'trxn.edit' })}
            </a>
          }
        >
          <a key="edit" onClick={() => handleEdit(row)}>
            {t.formatMessage({ id: 'trxn.edit' })}
          </a>
        </Access>,
        <Access
          accessible={access?.MemberTransaction.FiatPaymentType.Delete}
          fallback={
            <Popconfirm
            disabled
            placement="topRight"
            title={t.formatMessage({ id: 'messages.paymentTypeDelete'})}
            okText={t.formatMessage({ id: 'modal.yes' })}
            onConfirm={() => handleDeletePaymentType(row)}
            cancelText={t.formatMessage({ id: 'modal.no' })}
          >
            <a style={{ pointerEvents: 'none', color: '#ddd' }}>{t.formatMessage({ id: 'modal.delete' })}</a>
          </Popconfirm>
          }
        >
          <Popconfirm
            placement="topRight"
            title={t.formatMessage({ id: 'messages.paymentTypeDelete' })}
            okText={t.formatMessage({ id: 'modal.yes' })}
            onConfirm={() => handleDeletePaymentType(row)}
            cancelText={t.formatMessage({ id: 'modal.no' })}
          >
            <a>{t.formatMessage({ id: 'modal.delete' })}</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];

  const fetchTableData = async (values: any) => {
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

    const data = await getFiatPaymentTypeList('Member');

    return data;
  };

  useEffect(() => {
    const currMenuAccess = access?.MemberTransaction.FiatPaymentType;
    const fiatPaymentType = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(fiatPaymentType.length > 0);
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
        <ProTable<PaymentTypeItem, Pagination>
          actionRef={tableRef}
          className={styles.paymentTypeTable}
          rowKey="id"
          loading={tableLoading}
          cardBordered={true}
          search={false}
          options={false}
          request={fetchTableData}
          pagination={false}
          columns={access?.MemberTransaction.FiatPaymentType.List ? columns : []}
          toolBarRender={() => [
            <Access accessible={access?.MemberTransaction.FiatPaymentType.Add}>
              <Button key="add" type="primary" onClick={() => setShowAdd(true)}>
                {t.formatMessage({ id: 'table.addPayment' })}
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
      <AddPaymentType
        visible={showAdd}
        close={() => setShowAdd(false)}
        reloadTable={() => tableRef?.current?.reloadAndRest?.()}
      />
      <EditPaymentType
        currentRow={currentRow}
        visible={showEdit}
        close={() => setShowEdit(false)}
        reloadTable={() => tableRef?.current?.reloadAndRest?.()}
      />
    </Access>
  );
};

export default PaymentType;
