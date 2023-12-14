import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm, ProFormUploadButton } from '@ant-design/pro-form';
import { Button, message, Modal, Image, Form } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Access, useAccess, useIntl } from 'umi';
import { updateDeposit } from '@/pages/transaction/merchant/deposit/service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import style from './style.less';
import type { UploadFile } from 'antd/es/upload/interface';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: MerchantDepositItem | undefined;
  reloadTable: () => void;
}

const CryptoDepositRequest: FC<Props> = ({ visible, close, currentRow, reloadTable }) => {
  const t = useIntl();
  const access: any = useAccess();
  const { confirm } = Modal;
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>();

  const remarksDict = {
    withdrawalRemarksDontSplit: t.formatMessage({ id: 'trxn.withdrawalRemarksDontSplit' }),
    withdrawalRemarksElectronicReceipt: t.formatMessage({
      id: 'trxn.withdrawalRemarksElectronicReceipt',
    }),
    withdrawalRemarksMutiplePens: t.formatMessage({ id: 'trxn.withdrawalRemarksMutiplePens' }),
    withdrawalRemarks2Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks2Pens' }),
    withdrawalRemarks3Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks3Pens' }),
  };

  const handleSubmit = async (values: any) => {
    try {
      const newForm = new FormData();
      const files = values.file.map((f: any) => f.originFileObj);
      const depositId = currentRow?.id as string;
      files
        .filter((_file: any) => _file?.uid && _file?.uid !== 'default')
        .forEach((file: any) => {
          newForm.append(`files`, file);
        });
      newForm.set(
        'merchantToMerchantDepositUpdateParam',
        new Blob(
          [
            JSON.stringify({
              depositId,
            }),
          ],
          { type: 'application/json' },
        ),
      );
      await updateDeposit(newForm);
      message.success(t.formatMessage({ id: 'messages.saved' }));
      reloadTable();
      close();
      form.resetFields();
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const showConfirm = async (values: any) => {
    confirm({
      centered: true,
      title: t.formatMessage({ id: 'modal.confirmDeposit' }),
      content: (
        <div>
          <p style={{ marginBottom: 0 }}>{t.formatMessage({ id: 'modal.confirmDepositDesc' })}</p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      okText: t.formatMessage({ id: 'modal.confirm' }),
      cancelText: t.formatMessage({ id: 'modal.cancel' }),
      async onOk() {
        await handleSubmit(values);
      },
    });
  };

  const hideSubmit = () => {
    if (['In Progress', 'Under Review'].includes(currentRow?.status as string)) {
      if (currentRow?.receipts.length === 3) {
        return true;
      }
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (visible) {
      const data = currentRow?.receipts.map((receipt: string) => {
        return {
          uid: 'default',
          status: 'done',
          url: receipt,
        };
      });
      setFileList(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <ModalForm
      form={form}
      visible={visible}
      className={style.merchantDepositModal}
      onFinish={showConfirm}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
      submitter={{
        render: ({ submit, submitButtonProps }: any) => {
          return [
            <Access key="submit" accessible={access.MerchantTransaction.Deposit.Submit}>
              <Button
                loading={submitButtonProps?.loading || false}
                type="primary"
                key="close"
                onClick={submit}
                hidden={hideSubmit()}
              >
                {currentRow?.status === 'In Progress'
                  ? t.formatMessage({ id: 'modal.submit' })
                  : t.formatMessage({ id: 'modal.update' })}
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
          <ProDescriptions<MerchantDepositItem>
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
                dataIndex: ['withdrawal', 'orderId'],
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.paymentDetails' })}
          </p>
          <ProDescriptions<MerchantDepositItem>
            column={1}
            title={false}
            style={{ marginBottom: '1rem' }}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.cryptoPayment' }),
                dataIndex: ['withdrawal', 'cryptoPayment'],
                style: { paddingBottom: 5 },
              },
              {
                title: t.formatMessage({ id: 'trxn.cryptoAddress' }),
                dataIndex: ['withdrawal', 'cryptoAddress'],
                style: { paddingBottom: 5 },
              },
              {
                dataIndex: 'qrCode',
                render: (value: any) => {
                  if (value) {
                    return <Image src={value} width={120} />;
                  }
                  return null;
                },
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.transactionDetails' })}
          </p>
          <ProDescriptions<MerchantDepositItem>
            column={1}
            title={false}
            style={{ marginBottom: '1rem' }}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderId,
            }}
            columns={[
              {
                title: t.formatMessage({ id: 'trxn.amount' }),
                dataIndex: ['withdrawal', 'amount'],
                style: { paddingBottom: 5 },
              },
              {
                title: t.formatMessage({ id: 'trxn.exchangeRate' }),
                dataIndex: ['withdrawal', 'exchangeRate'],
                style: { paddingBottom: 0 },
              },
              {
                dataIndex: 'cryptoAmount',
                style: { paddingTop: 0 },
                render: (_, entity: any) => {
                  return (
                    <p style={{ fontSize: '16px', fontWeight: 700 }}>
                      {t.formatMessage({ id: 'trxn.usdtWithdrawalAmount' })}:
                      <span style={{ fontSize: '25px' }}>
                        {' '}
                        {(entity.withdrawal && entity.withdrawal.amount) *
                          (entity.withdrawal && entity.withdrawal.exchangeRate) || '0.00'}
                      </span>
                    </p>
                  );
                },
              },
            ]}
          />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>
            {t.formatMessage({ id: 'trxn.remarks' })}
          </p>
          <ProDescriptions<MerchantDepositItem>
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
                // dataIndex: ['withdrawal', 'remark'],
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
          {['In Progress', 'Under Review'].includes(currentRow?.status as string) &&
            currentRow?.receipts.length < 3 && (
              <ProFormUploadButton
                rules={[
                  { required: true, message: '' },
                  {
                    validator: (_: any, _fileList: any) => {
                      const newFiles = _fileList.filter(
                        (_file: any) => _file.uid && _file.uid !== 'default',
                      );
                      return newFiles.length > 0 ? Promise.resolve() : Promise.reject();
                    },
                    message: t.formatMessage({ id: 'messages.electronicReceiptIsRequired' }),
                  },
                ]}
                max={3}
                listType="picture-card"
                label={t.formatMessage({ id: 'trxn.electronicReceipt' })}
                name="file"
                accept=".jpg,.jpeg,.png"
                title={t.formatMessage({ id: 'modal.upload' })}
                fieldProps={{
                  beforeUpload: () => false,
                  defaultFileList: fileList,
                  maxCount: 3,
                  onRemove: (file: any) => file.uid !== 'default',
                }}
              />
            )}
          {!['In Progress'].includes(currentRow?.status) && currentRow?.receipts.length === 3 && (
            <>
              <p style={{ fontSize: '16px', fontWeight: '700' }}>
                {t.formatMessage({ id: 'trxn.electronicReceipt' })}
              </p>
              <ProDescriptions<MerchantDepositItem>
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
                    dataIndex: ['receipts'],
                    render: (value: any) => {
                      if (value && value.length > 0) {
                        return value.map((val: any) => {
                          return (
                            <Image key={val} src={val} width={120} style={{ paddingRight: 5 }} />
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
        </>
      )}
    </ModalForm>
  );
};

export default CryptoDepositRequest;
