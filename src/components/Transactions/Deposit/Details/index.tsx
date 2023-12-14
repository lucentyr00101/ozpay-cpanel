import type { FC } from 'react';
import { useState } from 'react';
import type { DepositItem } from '@/pages/transaction/shared/deposit/data.d';
import styles from '@/pages/transaction/shared/deposit/style.less';
import { ModalForm } from '@ant-design/pro-form';
import { useIntl } from 'umi';
import { Button, Divider, Image } from 'antd';
import ProDescriptions from '@ant-design/pro-descriptions';
import ImagePreview from '@/components/Transactions/Withdrawal/ImagePreview';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: DepositItem | undefined;
}

const DepositDetails: FC<Props> = ({ visible, close, currentRow }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imgUrl] = useState('' as any);

  const t = useIntl();

  return (
    <ModalForm
      className={styles.depositDetails}
      width={1000}
      title={t.formatMessage({ id: 'trxn.details' })}
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
      submitter={{
        render: (props, defaultDoms) => {
          console.log(defaultDoms);
          return [
            <Button type="primary" key="close" onClick={() => close()}>
              {t.formatMessage({ id: 'modal.close' })}
            </Button>,
          ];
        },
      }}
    >
      {currentRow?.id && (
        <>
          {/* <p style={{ fontSize: '16px', fontWeight: '500' }}>
            {t.formatMessage({ id: 'trxn.details' })}
          </p> */}
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.orderInfo' })}
          </Divider>
          <ProDescriptions<DepositItem>
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
                title: t.formatMessage({ id: 'trxn.merchant' }),
                dataIndex: ['merchant', 'username'],
              },
              { title: t.formatMessage({ id: 'trxn.member' }), dataIndex: ['member', 'username'] },
              {
                title: t.formatMessage({ id: 'trxn.status' }),
                dataIndex: 'status',
                valueEnum: {
                  'Timed Out': {
                    text: t.formatMessage({ id: 'table.Timed Out' }),
                    clor: '#D9D9D9',
                  },
                  Cancelled: {
                    text: t.formatMessage({ id: 'table.Cancelled' }),
                    color: '#FF4D4F',
                  },
                  Completed: {
                    text: t.formatMessage({ id: 'table.Completed' }),
                    color: '#52C41A',
                  },
                  'In Progress': {
                    text: t.formatMessage({ id: 'table.In Progress' }),
                    color: '#B37FEB',
                  },
                  'Under Review': {
                    text: t.formatMessage({ id: 'table.Under Review' }),
                    color: '#FAAD14',
                  },
                },
              },
              {
                title: t.formatMessage({ id: 'trxn.orderId' }),
                dataIndex: ['withdrawal', 'orderId'],
              },
              {
                title: t.formatMessage({ id: 'trxn.amount' }),
                dataIndex: ['withdrawal', 'amount'],
              },
              { title: t.formatMessage({ id: 'table.fee' }), dataIndex: 'fee' },
            ]}
          />
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.paymentInfo' })}
          </Divider>
          {currentRow?.withdrawal?.cryptoAddress !== null &&
          currentRow?.withdrawal?.cryptoPayment !== null ? (
            <ProDescriptions<DepositItem>
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
                  dataIndex: ['withdrawal', 'cryptoPayment'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.amount' }),
                  dataIndex: ['withdrawal', 'amount'],
                  span: 2,
                },
                {
                  title: t.formatMessage({ id: 'trxn.cryptoAddress' }),
                  dataIndex: ['withdrawal', 'cryptoAddress'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.exchangeRate' }),
                  dataIndex: ['withdrawal', 'exchangeRate'],
                  span: 2,
                },
                {
                  title: t.formatMessage({ id: 'trxn.qrCode' }),
                  dataIndex: ['withdrawal', 'cryptoAddressQrCode'],
                  valueType: 'image',
                  render: (value: any) => {
                    if (value) {
                      return <Image src={value} width={120} />;
                    }
                    return null;
                  },
                },
                {
                  title: t.formatMessage({ id: 'trxn.usdtAmount' }),
                  dataIndex: 'amount',
                  span: 2,
                  render: (_, value) => {
                    console.log(value);
                    const final = value.withdrawal?.exchangeRate * value.withdrawal?.amount;
                    return final;
                  },
                },
              ]}
            />
          ) : (
            <ProDescriptions<DepositItem>
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
                {
                  title: t.formatMessage({ id: 'trxn.bankName' }),
                  dataIndex: ['withdrawal', 'bankName'],
                  span: 2,
                  ellipsis: true,
                },
                {
                  title: t.formatMessage({ id: 'trxn.accountName' }),
                  dataIndex: ['withdrawal', 'accountName'],
                  ellipsis: true,
                },
                {
                  title: t.formatMessage({ id: 'trxn.accountNumber' }),
                  dataIndex: ['withdrawal', 'accountNo'],
                  span: 2,
                  ellipsis: true,
                },
              ]}
            />
          )}
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.duration' })}
          </Divider>
          <ProDescriptions<DepositItem>
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
                dataIndex: ['withdrawal', 'acceptTimeLimit'],
                render(dom) {
                  return !dom ? '-' : `${dom} ${t.formatMessage({ id: 'trxn.minutes' })}`;
                },
              },
              {
                title: t.formatMessage({ id: 'trxn.acceptedExpiredTime' }),
                dataIndex: 'acceptedExpiryTime',
                span: 2,
              },
              {
                title: t.formatMessage({ id: 'trxn.paymentTimeLimit' }),
                dataIndex: ['withdrawal', 'paymentTimeLimit'],
                render(dom) {
                  return !dom ? '-' : `${dom} ${t.formatMessage({ id: 'trxn.minutes' })}`;
                },
              },
              currentRow.status !== 'Waiting'
                ? {
                    title: t.formatMessage({ id: 'trxn.paymentExpiredTime' }),
                    dataIndex: 'paymentExpiryTime',
                    span: 2,
                  }
                : (null as any),
            ]}
          />
          <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
            {t.formatMessage({ id: 'trxn.others' })}
          </Divider>
          <ProDescriptions<DepositItem>
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
          <ProDescriptions<DepositItem>
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
                dataIndex: 'receipt',
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
          <ImagePreview
            visible={showPreview}
            image={currentRow?.receipt}
            close={() => setShowPreview(false)}
            url={imgUrl}
            status={currentRow?.status}
            id={currentRow?.id}
            closeParent={() => {
              close();
            }}
          />
        </>
      )}
    </ModalForm>
  );
};

export default DepositDetails;
