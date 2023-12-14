import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';

import { Access, useAccess, useIntl } from 'umi';

import { Button, message, notification, Popconfirm, Result, Space, Switch } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';

import NotificationMsgBox from '@/components/NotificationMsgBox/NotificationMsgBox';
import AddCryptoPaymentType from '@/components/Transactions/CryptoPaymentTypes/Add';
import EditCryptoPaymentType from '@/components/Transactions/CryptoPaymentTypes/Edit';

import type { MerchantCryptoPaymentItem, Pagination } from '../../shared/crypto-payment-type/data';
import {
  cryptoDeletePaymentType,
  cryptoUpdatePaymentType,
  getCryptoPaymentTypes,
} from '../../shared/crypto-payment-type/service';
import { daysColoredMapping } from '../../member/crypto-payment-type';
import { STATUS } from '@/components/enums/dictionary/dictionary.enum';

const MerchantCryptoPaymentType: FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<MerchantCryptoPaymentItem | null>(null);

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

  const showNotification = (notifMsg: string) => {
    notification.success({
      message: notifMsg,
      duration: 2,
    });
  };

  const handleEdit = (row: MerchantCryptoPaymentItem) => {
    setShowEdit(true);
    setCurrentRow(row);
  };

  const handleDeletePaymentType = async (value: any) => {
    try {
      await cryptoDeletePaymentType({ id: value.id });
      showNotification(t.formatMessage({ id: 'messages.deleted' }));
      tableRef?.current?.reloadAndRest?.();
    } catch (error: any) {
      message.error(error.data.message);
    }
  };

  const handleToggleStatus = async (row: MerchantCryptoPaymentItem) => {
    try {
      const newForm = new FormData();
      newForm.set(
        'cryptoPaymentTypeUpdateParam',
        new Blob(
          [
            JSON.stringify({
              ...row,
              exchangeRate: (+row.exchangeRate).toFixed(2),
              status: row.status === STATUS.ENABLE ? STATUS.DISABLE : STATUS.ENABLE,
            }),
          ],
          { type: 'application/json' },
        ),
      );
      await cryptoUpdatePaymentType(newForm);
      message.success(t.formatMessage({ id: 'messages.savedStatus' }));
    } catch (e: any) {
      // console.log({ e });
      if (e?.data?.code == 2010007) {
        message.error(t.formatMessage({ id: 'messages.paymentTypeStatusFail' }));
      } else {
        message.error(e?.data?.message || 'Something went wrong.');
      }
    } finally {
      tableRef?.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<MerchantCryptoPaymentItem>[] = [
    {
      title: <span>{t.formatMessage({ id: 'table.cryptoname' })}</span>,
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.networkChain' })}</span>,
      dataIndex: 'networkName',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'trxn.exchangeRate' })}</span>,
      dataIndex: 'exchangeRate',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.operatingHours' })}</span>,
      dataIndex: 'operatingHours',
      hideInSearch: true,
    },
    {
      title: <span>{t.formatMessage({ id: 'table.repeat' })}</span>,
      dataIndex: 'repeat',
      hideInSearch: true,
      width: 75,
      renderFormItem: (_, { defaultRender }) => {
        return defaultRender(_);
      },
      render: (_, record) => (
        <Space style={{ display: 'block' }}>
          {record.repeatDays.split(',').map((item) => {
            const { color, background, border } = daysColoredMapping[item];
            return (
              <span
                key={item}
                style={{
                  color: `${color}`,
                  background: `${background}`,
                  border: `1px solid ${border}`,
                  padding: '0 7px',
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              >
                {t.formatMessage({ id: `table.${item}` })}
              </span>
            );
          })}
        </Space>
      ),
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'avatar',
      render: (_, value) => {
        return (
          <Access
            accessible={access?.MerchantTransaction?.CryptoPaymentType?.UpdateStatus}
            fallback={
              <Switch
                disabled
                checkedChildren="&#10003;"
                unCheckedChildren="&#x2715;"
                checked={value.status === STATUS.ENABLE}
              />
            }
          >
            <Switch
              checkedChildren="&#10003;"
              unCheckedChildren="&#x2715;"
              checked={value.status === STATUS.ENABLE}
              onChange={() => handleToggleStatus(value)}
            />
          </Access>
        );
      },
    },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, row: any) => [
        <Access key="edit" accessible={access?.MerchantTransaction.CryptoPaymentType.Edit}>
          <a key="edit" onClick={() => handleEdit(row)}>
            {t.formatMessage({ id: 'trxn.edit' })}
          </a>
        </Access>,
        <Access key="delete" accessible={access?.MerchantTransaction.CryptoPaymentType.Delete}>
          <Popconfirm
            key="delete"
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

    const data = await getCryptoPaymentTypes('Merchant');

    return data;
  };

  useEffect(() => {
    const currMenuAccess = access?.MerchantTransaction.CryptoPaymentType;
    const cryptoPaymentType = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(cryptoPaymentType.length > 0);
  }, []);

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
          <NotificationMsgBox />
          <ProTable<MerchantCryptoPaymentItem, Pagination>
            rowKey="key"
            actionRef={tableRef}
            options={false}
            cardBordered={true}
            request={fetchTableData}
            search={false}
            pagination={paginationProps}
            columns={access?.MerchantTransaction.CryptoPaymentType.List ? columns : []}
            toolBarRender={() => [
              <Access
                key="addCryptoPayment"
                accessible={access?.MerchantTransaction.CryptoPaymentType.AddCryptoPayment}
              >
                <Button key="addCryptoPayment" type="primary" onClick={() => setShowAdd(true)}>
                  {t.formatMessage({ id: 'table.addCryptoPayment' })}
                </Button>
              </Access>,
            ]}
          />
        </PageContainer>
      </Access>
      <AddCryptoPaymentType
        visible={showAdd}
        close={() => setShowAdd(false)}
        reloadTable={() => tableRef?.current?.reloadAndRest?.()}
      />
      <EditCryptoPaymentType
        visible={showEdit}
        close={() => setShowEdit(false)}
        reloadTable={() => tableRef?.current?.reloadAndRest?.()}
        currentRow={currentRow}
      />
    </>
  );
};

export default MerchantCryptoPaymentType;
