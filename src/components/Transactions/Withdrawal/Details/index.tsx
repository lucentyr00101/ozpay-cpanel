import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm } from '@ant-design/pro-form';
import { Button, Divider } from 'antd';
import type { FC } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import type { WithdrawalItem } from '@/pages/transaction/shared/withdrawal/data';
import styles from './index.less';
import ImagePreview from '@/components/Transactions/Withdrawal/ImagePreview';
import { useIntl } from 'umi';
import { useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: WithdrawalItem | undefined;
  reloadTable: () => void;
  loading: boolean;
}

const WithdrawalDetails: FC<Props> = ({ visible, close, currentRow, reloadTable, loading }) => {
  const t = useIntl();
  const [showPreview, setShowPreview] = useState(false);
  const [imgUrl] = useState('' as any);
  const orderRef = useRef<ActionType>();

  useEffect(() => {
    if (!loading) orderRef?.current?.reload?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <ModalForm
      className={styles.withdrawalDetails}
      width={1000}
      title={false}
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
      submitter={{
        render: () => {
          return [
            <Button type="primary" key="close" onClick={() => close()}>
              {t.formatMessage({ id: 'modal.close' })}
            </Button>,
          ];
        },
      }}
    >
      {currentRow?.orderId && (
        <>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>
            {t.formatMessage({ id: 'trxn.details' })}
          </p>
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.orderInfo' })}
          </Divider>
          <ProDescriptions<WithdrawalItem>
            actionRef={orderRef}
            column={3}
            title={false}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.merchant' }),
                dataIndex: ['merchant', 'sysUser', 'username'],
              },
              {
                title: t.formatMessage({ id: 'trxn.member' }),
                dataIndex: ['member', 'username'],
              },
              {
                title: t.formatMessage({ id: 'trxn.status' }),
                dataIndex: 'status',
                valueEnum: {
                  Waiting: {
                    text: `${t.formatMessage({ id: 'table.Waiting' })}`,
                    color: '#FAAD14',
                  },
                  'In Progress': {
                    text: `${t.formatMessage({ id: 'table.In Progress' })}`,
                    color: '#1890FF',
                  },
                  'Under Review': {
                    text: `${t.formatMessage({ id: 'table.Under Review' })}`,
                    color: '#FAAD14',
                  },
                  Completed: {
                    text: `${t.formatMessage({ id: 'table.Completed' })}`,
                    color: '#52C41A',
                  },
                  Cancelled: {
                    text: `${t.formatMessage({ id: 'table.Cancelled' })}`,
                    color: '#FF4D4F',
                  },
                  'Timed Out': {
                    text: `${t.formatMessage({ id: 'table.Timed Out' })}`,
                    color: '#D9D9D9',
                  },
                },
                // render: (data: any, value) => {
                //   console.log("Details",value);
                //   console.log("Details-data",data);
                //   return( t.formatMessage({ id: 'table.' + value.status }))
                // },
              },
              {
                title: t.formatMessage({ id: 'trxn.orderId' }),
                dataIndex: 'orderId',
              },
              {
                title: t.formatMessage({ id: 'trxn.amount' }),
                dataIndex: 'amount',
                render: (v: any) => (v && v.toFixed(2)) || 0,
              },
            ]}
          />
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.paymentInfo' })}
          </Divider>
          {currentRow?.paymentType?.groupType == 'Crypto' ? (
            <ProDescriptions<WithdrawalItem>
              column={3}
              title={false}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.orderId,
              }}
              columns={[
                {
                  title: t.formatMessage({ id: 'trxn.paymentType' }),
                  dataIndex: ['paymentType', 'name'],
                },
                { title: t.formatMessage({ id: 'trxn.amount' }), dataIndex: 'amount', span: 2 },
                {
                  title: t.formatMessage({ id: 'trxn.cryptoAddress' }),
                  dataIndex: 'cryptoAddress',
                },
                {
                  title: t.formatMessage({ id: 'trxn.exchangeRate' }),
                  dataIndex: 'exchangeRate',
                  span: 2,
                },
                {
                  title: t.formatMessage({ id: 'trxn.qrCode' }),
                  dataIndex: 'qrCode',
                  valueType: 'image',
                  fieldProps: {
                    width: 100,
                  },
                },
                {
                  title: t.formatMessage({ id: 'trxn.usdtAmount' }),
                  dataIndex: 'amount',
                  span: 2,
                  render: (_, value) => {
                    console.log(value);
                    const final = value.exchangeRate * value.amount;
                    return final;
                  },
                },
              ]}
            />
          ) : (
            <ProDescriptions<WithdrawalItem>
              column={3}
              title={false}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.orderId,
              }}
              columns={[
                {
                  title: t.formatMessage({ id: 'trxn.paymentType' }),
                  dataIndex: ['paymentType', 'name'],
                },
                { title: t.formatMessage({ id: 'trxn.bankName' }), dataIndex: 'bankName', span: 2 },
                { title: t.formatMessage({ id: 'trxn.accountName' }), dataIndex: 'accountName' },
                {
                  title: t.formatMessage({ id: 'trxn.accountNumber' }),
                  dataIndex: 'accountNo',
                  span: 2,
                },
              ]}
            />
          )}

          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.duration' })}
          </Divider>
          <ProDescriptions<WithdrawalItem>
            column={3}
            title={false}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.acceptedTimeLimit' }),
                dataIndex: 'acceptedTimeLimit',
                render: (dom: any) => {
                  return dom + t.formatMessage({ id: 'trxn.minutes' });
                },
              },
              {
                title: t.formatMessage({ id: 'trxn.acceptedExpiredTime' }),
                dataIndex: 'acceptedExpiredTime',
                span: 2,
              },
              {
                title: t.formatMessage({ id: 'trxn.paymentTimeLimit' }),
                dataIndex: 'paymentTimeLimit',
                render: (dom: any) => {
                  return dom + t.formatMessage({ id: 'trxn.minutes' });
                },
              },
              currentRow.status === 'In Progress'
                ? {
                    title: t.formatMessage({ id: 'trxn.paymentExpiredTime' }),
                    dataIndex: 'paymentExpiredTime',
                    span: 2,
                  }
                : (null as any),
            ]}
          />
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.others' })}
          </Divider>
          <ProDescriptions<WithdrawalItem>
            column={3}
            title={false}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.createdBy' }),
                dataIndex: 'createdBy',
              },
              {
                title: t.formatMessage({ id: 'trxn.createdAt' }),
                dataIndex: 'createdTime',
                valueType: 'dateTime',
              },
              {
                title: t.formatMessage({ id: 'trxn.ipAddressCreatedBy' }),
                dataIndex: 'createdIp',
              },
              {
                title: t.formatMessage({ id: 'trxn.lastUpdatedBy' }),
                dataIndex: 'updatedBy',
              },
              {
                title: t.formatMessage({ id: 'trxn.lastUpdatedTime' }),
                dataIndex: 'updatedTime',
                valueType: 'dateTime',
              },
              {
                title: t.formatMessage({ id: 'trxn.ipAddresslastUpdatedBy' }),
                dataIndex: 'updatedIp',
              },
            ]}
          />
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.receipt' })}
          </Divider>
          <ProDescriptions<WithdrawalItem>
            column={2}
            title={false}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.upload' }),
                dataIndex: ['deposit', 'receipt'],
                valueType: 'image',
                fieldProps: {
                  width: 100,
                },
                // render: (dom: any) => {
                //   return (
                //     <div>
                //       {!!dom ? (
                //         <Image
                //           src={dom}
                //           width={100}
                //           preview={{ visible: false }}
                //           onClick={() => {
                //             setShowPreview(true);
                //             setImgUrl(dom);
                //           }}
                //         />
                //       ) : (
                //         <span>-</span>
                //       )}
                //     </div>
                //   );
                // },
              },
              {
                title: t.formatMessage({ id: 'trxn.remarks' }),
                dataIndex: 'remark',
              },
            ]}
          />
        </>
      )}
      <ImagePreview
        visible={showPreview}
        image={currentRow?.receipt}
        close={() => setShowPreview(false)}
        url={imgUrl}
        status={currentRow?.status}
        id={currentRow?.id}
        closeParent={() => {
          close();
          reloadTable();
        }}
      />
    </ModalForm>
  );
};

export default WithdrawalDetails;
