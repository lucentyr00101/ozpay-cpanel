import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { getLocale, useIntl } from 'umi';

import { Button, Divider } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm } from '@ant-design/pro-form';

import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import type { AccountTransactionRecordItem } from '@/pages/members/account-transaction-records/data';
import { fetchStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';

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
      {currentRow?.orderId && (
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
                title: t.formatMessage({ id: 'trxn.fees' }),
                dataIndex: ['withdrawal', 'deposit', 'fee'],
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
                render: (v: any) => v.toFixed(2),
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
          {currentRow?.withdrawal?.cryptoAddress !== null &&
          currentRow?.withdrawal?.cryptoPayment !== null ? (
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
                  valueType: 'image',
                  // render: (value)=> {
                  //  if(value){
                  //   return <img src={value} alt="QR Code" width={160} height={160} />
                  //  }
                  //  return null;
                  // }
                },
                {
                  title: t.formatMessage({ id: 'trxn.usdtAmount' }),
                  dataIndex: ['withdrawal'],
                  render: (value: any) => {
                    let usdtAmount: number = 0;
                    if (value && value.amount && value.exchangeRate) {
                      usdtAmount = value.amount * value.exchangeRate;
                    }
                    return usdtAmount;
                  },
                },
              ]}
            />
          ) : (
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
                  dataIndex: ['withdrawal', 'paymentType', 'name'],
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
                dataIndex: 'createdIp',
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
              },
            ]}
          />
        </>
      )}
    </ModalForm>
  );
};

export default AccountTransactionDetails;
