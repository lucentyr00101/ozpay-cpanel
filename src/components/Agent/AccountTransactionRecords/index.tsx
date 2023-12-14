import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { getLocale, useIntl } from 'umi';

import { Button, Divider, Image } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm } from '@ant-design/pro-form';

import type { AccountTransactionRecordItem } from '@/pages/merchant/account-transaction-records/data';
import { fetchStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';

import styles from './index.less';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: AccountTransactionRecordItem | null;
}

const AccountTransactionDetails: FC<Props> = ({ visible, close, currentRow }) => {
  const t = useIntl();
  const selectedLang = getLocale();

  const [statusEnums, setStatusEnums] = useState({});

  const fetchDictionaryWithdrawalStatus = async () => {
    const statusEnumValue = await fetchStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Withdrawal_Status_Code,
      selectedLang,
    );
    setStatusEnums(statusEnumValue);
  };

  const remarksDict = {
    withdrawalRemarksDontSplit: t.formatMessage({ id: 'trxn.withdrawalRemarksDontSplit' }),
    withdrawalRemarksElectronicReceipt: t.formatMessage({
      id: 'trxn.withdrawalRemarksElectronicReceipt',
    }),
    withdrawalRemarksMutiplePens: t.formatMessage({ id: 'trxn.withdrawalRemarksMutiplePens' }),
    withdrawalRemarks2Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks2Pens' }),
    withdrawalRemarks3Pens: t.formatMessage({ id: 'trxn.withdrawalRemarks3Pens' }),
  };

  useEffect(() => {
    fetchDictionaryWithdrawalStatus();
  }, [selectedLang]);

  return (
    <ModalForm
      className={styles['account-transaction-details']}
      width={1000}
      title={false}
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
        closeIcon: <CloseCircleOutlined style={{ color: '#000', fontSize: '20px' }} />,
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
      {currentRow?.orderId &&
        currentRow?.transactionType !== 'System Addition' &&
        currentRow?.transactionType !== 'System Deduction' && (
          <>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              {t.formatMessage({ id: 'trxn.details' })}
            </p>
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.orderInfo' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  title: t.formatMessage({ id: 'table.agent' }),
                  dataIndex: 'merchantUsername',
                },
                {
                  title: t.formatMessage({ id: 'trxn.fees' }),
                  dataIndex: ['withdrawal', 'deposit', 'fee'],
                  hideInDescriptions:
                    currentRow.transactionType === 'Withdrawal' ||
                    currentRow.transactionType === 'Withdrawal Timed Out' ||
                    currentRow.transactionType === 'Withdrawal Cancelled',
                },
              ]}
            />
            <ProDescriptions<AccountTransactionRecordItem>
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
                  title: t.formatMessage({ id: 'trxn.orderId' }),
                  dataIndex: 'orderId',
                },
                {
                  title: t.formatMessage({ id: 'table.amount' }),
                  dataIndex: 'changeTrans',
                  render: (v: any) => v && Math.abs(v).toFixed(2),
                },
                {
                  title: t.formatMessage({ id: 'table.status' }),
                  dataIndex: ['withdrawal', 'status'],
                  valueEnum: statusEnums,
                },
              ]}
            />
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.paymentInfo' })}
            </Divider>
            {currentRow?.withdrawal?.paymentType?.groupType === 'Crypto' && (
              <ProDescriptions<AccountTransactionRecordItem>
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
                    title: t.formatMessage({ id: 'trxn.cryptoPayment' }),
                    dataIndex: ['withdrawal', 'cryptoPayment'],
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.amount' }),
                    dataIndex: ['withdrawal', 'amount'],
                    render: (v: any) => v && v.toFixed(2),
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.cryptoAddress' }),
                    dataIndex: ['withdrawal', 'cryptoAddress'],
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.exchangeRate' }),
                    dataIndex: ['withdrawal', 'exchangeRate'],
                  },
                  {
                    dataIndex: ['withdrawal', 'qrCode'],
                    render: (qrCodeVal: any) => {
                      if (qrCodeVal) {
                        return <Image src={qrCodeVal} alt="QR Code" width={160} height={160} />;
                      }
                      return null;
                    },
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.usdtAmount' }),
                    dataIndex: ['withdrawal'],
                    render: (value: any) => {
                      let usdtAmount: number = 0;
                      if (value && value.amount && value.exchangeRate) {
                        usdtAmount = value.amount * value.exchangeRate;
                      }
                      return usdtAmount.toFixed(2);
                    },
                  },
                ]}
              />
            )}
            {currentRow?.withdrawal?.paymentType?.groupType !== 'Crypto' && (
              <ProDescriptions<AccountTransactionRecordItem>
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
                    // dataIndex: ['withdrawal', 'paymentTypeTag'],
                    dataIndex: ['withdrawal', 'paymentType', 'groupType'],
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.bankName' }),
                    dataIndex: ['withdrawal', 'bankName'],
                    span: 2,
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.accountName' }),
                    dataIndex: ['withdrawal', 'accountName'],
                  },
                  {
                    title: t.formatMessage({ id: 'trxn.accountNumber' }),
                    dataIndex: ['withdrawal', 'accountNo'],
                    span: 2,
                  },
                ]}
              />
            )}
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.duration' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  title: t.formatMessage({ id: 'trxn.acceptedTimeLimit' }),
                  dataIndex: ['withdrawal', 'acceptedTimeLimit'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.acceptedExpiredTime' }),
                  dataIndex: ['withdrawal', 'acceptedExpiredTime'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.paymentTimeLimit' }),
                  dataIndex: ['withdrawal', 'paymentTimeLimit'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.paymentExpiredTime' }),
                  dataIndex: ['withdrawal', 'paymentExpiredTime'],
                  hideInDescriptions: currentRow.withdrawal?.status !== 'In Progress',
                },
              ]}
            />
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.others' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  dataIndex: ['withdrawal', 'createdBy'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.createdAt' }),
                  dataIndex: 'createdTime',
                  valueType: 'dateTime',
                },
                {
                  title: t.formatMessage({ id: 'trxn.ipAddressCreatedBy' }),
                  // dataIndex: 'createdIp',
                  dataIndex: ['withdrawal', 'createdIp'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.lastUpdatedBy' }),
                  dataIndex: ['withdrawal', 'updatedBy'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.lastUpdatedTime' }),
                  dataIndex: ['withdrawal', 'updatedTime'],
                  valueType: 'dateTime',
                },
                {
                  title: t.formatMessage({ id: 'trxn.ipAddresslastUpdatedBy' }),
                  dataIndex: ['withdrawal', 'updatedIp'],
                },
              ]}
            />
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.receipt' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  title: t.formatMessage({ id: 'trxn.upload' }),
                  dataIndex: ['withdrawal', 'deposit', 'receipt'],
                  valueType: 'image',
                },
                {
                  title: t.formatMessage({ id: 'trxn.remarks' }),
                  dataIndex: 'remark',
                  span: 2,
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
          </>
        )}

      {currentRow?.orderId &&
        (currentRow?.transactionType === 'System Addition' ||
          currentRow?.transactionType === 'System Deduction') && (
          <>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              {t.formatMessage({ id: 'trxn.details' })}
            </p>
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.orderInfo' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  dataIndex: 'merchantUsername',
                },
                {
                  title: t.formatMessage({ id: 'trxn.member' }),
                  dataIndex: 'memberUsername',
                },
                {
                  title: t.formatMessage({ id: 'table.transactionType' }),
                  dataIndex: 'transactionType',
                  render: (_, value) => {
                    return t.formatMessage({ id: 'table.' + value.transactionType });
                  },
                },
                {
                  title: t.formatMessage({ id: 'trxn.orderId' }),
                  dataIndex: 'orderId',
                },
              ]}
            />
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.paymentInfo' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  dataIndex: ['withdrawal', 'paymentTypeTag'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.bankName' }),
                  dataIndex: ['withdrawal', 'bankName'],
                  span: 2,
                },
                {
                  title: t.formatMessage({ id: 'trxn.accountName' }),
                  dataIndex: ['withdrawal', 'accountName'],
                },
                {
                  title: t.formatMessage({ id: 'trxn.accountNumber' }),
                  dataIndex: ['withdrawal', 'accountNo'],
                  span: 2,
                },
              ]}
            />
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.others' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
              ]}
            />
            <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
              {t.formatMessage({ id: 'trxn.receipt' })}
            </Divider>
            <ProDescriptions<AccountTransactionRecordItem>
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
                  title: t.formatMessage({ id: 'trxn.upload' }),
                  dataIndex: ['withdrawal', 'deposit', 'receipt'],
                  valueType: 'image',
                },
                {
                  title: t.formatMessage({ id: 'trxn.remarks' }),
                  dataIndex: 'remark',
                  span: 2,
                },
              ]}
            />
          </>
        )}
    </ModalForm>
  );
};

export default AccountTransactionDetails;
