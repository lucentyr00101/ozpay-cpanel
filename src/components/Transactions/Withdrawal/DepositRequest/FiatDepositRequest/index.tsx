/* eslint-disable react/no-array-index-key */
import type { MerchantWithdrawalItem } from '@/pages/transaction/shared/withdrawal/data';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm } from '@ant-design/pro-form';
import { Button, Image } from 'antd';
import type { FC } from 'react';
import { Access, useAccess, useIntl } from 'umi';
import style from '../CryptoDepositRequest/style.less';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: MerchantWithdrawalItem | undefined;
  deposit?: boolean;
  onApproveReject?: ({ id, status, updateStatus, remark }: any) => void;
}

const FiatDepositRequest: FC<Props> = ({
  visible,
  close,
  currentRow,
  deposit = false,
  onApproveReject,
}) => {
  const t = useIntl();
  const access: any = useAccess();

  const remarksDict = {
    withdrawalRemarksDontSplit: t.formatMessage({ id: 'trxn.withdrawalRemarksDontSplit' }),
    withdrawalRemarksElectronicReceipt: t.formatMessage({
      id: 'trxn.withdrawalRemarksElectronicReceipt',
    }),
    withdrawalRemarksMutiplePens: t.formatMessage({ id: 'trxn.withdrawalRemarksMutiplePens' }),
    withdrawalRemarks2Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks2Pens' }),
    withdrawalRemarks3Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks3Pens' }),
  };

  return (
    <ModalForm
      className={style.merchantWithdrawalModal}
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
      submitter={{
        render: () => {
          const id = currentRow && currentRow.id;
          const status = currentRow && currentRow.status;
          const remark = currentRow && currentRow.remark;

          return [
            <Access key="cancel" accessible={access.MerchantTransaction.Deposit.Cancel}>
              <Button type="default" key="cancel" onClick={() => close()} hidden={!deposit}>
                {t.formatMessage({ id: 'modal.cancel' })}
              </Button>
            </Access>,
            <Access key="reject" accessible={access.MerchantTransaction.Withdrawal.Reject}>
              <Button
                type="primary"
                danger
                key="reject"
                onClick={() => {
                  if (onApproveReject) {
                    onApproveReject({ id, status, updateStatus: 'Rejected', remark });
                  }
                  close();
                }}
                hidden={!(deposit === false && currentRow && currentRow.status === 'Under Review')}
              >
                {t.formatMessage({ id: 'modal.reject' })}
              </Button>
            </Access>,
            <Access key="approve" accessible={access.MerchantTransaction.Withdrawal.Approve}>
              <Button
                type="primary"
                key="confirm"
                onClick={() => {
                  if (onApproveReject) {
                    onApproveReject({ id, status, updateStatus: 'Completed', remark });
                  }
                  close();
                }}
                hidden={!(deposit === false && currentRow && currentRow.status === 'Under Review')}
              >
                {t.formatMessage({ id: 'modal.approve' })}
              </Button>
            </Access>,
            <Access key="close" accessible={access.MerchantTransaction.Deposit.Submit}>
              <Button type="primary" key="close" onClick={() => close()} hidden={!deposit}>
                {t.formatMessage({ id: 'modal.submit' })}
              </Button>
            </Access>,
          ];
        },
      }}
    >
      {currentRow?.id && (
        <>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>
            {t.formatMessage({ id: 'trxn.confirmDepostRequest' })}
          </p>
          <ProDescriptions<MerchantWithdrawalItem>
            column={3}
            title={false}
            request={async () => ({
              data: currentRow || {},
            })}
            style={{ marginBottom: '1.5rem' }}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'table.orderID' }),
                dataIndex: 'orderId',
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.paymentDetails' })}
          </p>
          <ProDescriptions<MerchantWithdrawalItem>
            column={1}
            title={false}
            style={{ marginBottom: '1.5rem' }}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.bankName' }),
                dataIndex: 'bankName',
                style: { paddingBottom: 5 },
              },
              {
                title: t.formatMessage({ id: 'trxn.bankCard' }),
                dataIndex: 'bankCard',
                style: { paddingBottom: 5 },
              },
              {
                title: t.formatMessage({ id: 'trxn.accountName' }),
                dataIndex: 'accountName',
                style: { paddingBottom: 5 },
              },
              {
                title: t.formatMessage({ id: 'trxn.accountNo' }),
                dataIndex: 'accountNo',
                style: { paddingBottom: 5 },
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.transactionDetails' })}
          </p>
          <ProDescriptions<MerchantWithdrawalItem>
            column={1}
            title={false}
            style={{ marginBottom: '1.5rem' }}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.amount' }),
                dataIndex: 'amount',
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.remarks' })}
          </p>
          <ProDescriptions<MerchantWithdrawalItem>
            column={1}
            title={false}
            style={{ marginBottom: '1.5rem' }}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                dataIndex: 'remark',
                render: (v: any) => {
                  return (
                    v &&
                    v.split(',').map((text: string) => {
                      return (
                        <p key={text} style={{ marginBottom: '0' }}>
                          {remarksDict[text] || text}
                        </p>
                      );
                    })
                  );
                },
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.electronicReceipt' })}
          </p>
          <ProDescriptions<MerchantWithdrawalItem>
            column={1}
            title={false}
            style={{ paddingBottom: 1 }}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                dataIndex: ['deposit', 'receipts'],
                render: (value: any) => {
                  if (value && value.length > 0) {
                    return value.map((val: any, index: number) => {
                      return (
                        <Image key={index} src={val} width={120} style={{ paddingRight: 5 }} />
                      );
                    });
                  }
                  return null;
                },
              },
            ]}
          />
        </>
      )}
    </ModalForm>
  );
};

export default FiatDepositRequest;
