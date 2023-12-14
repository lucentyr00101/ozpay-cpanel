import ProDescriptions from '@ant-design/pro-descriptions';
import { Divider } from 'antd';
import type { FC } from 'react';
import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import { useIntl } from 'umi';

interface Props {
  currentRow: MerchantDepositItem;
}

const FiatDepositCryptoPayment: FC<Props> = ({ currentRow }) => {
  const t = useIntl();

  return (
    <>
      <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
        {t.formatMessage({ id: 'trxn.paymentInfo' })}
      </Divider>
      <ProDescriptions<MerchantDepositItem>
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
            dataIndex: ['withdrawal', 'cryptoAddressQrCode'],
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
    </>
  );
};

export default FiatDepositCryptoPayment;
