import ProDescriptions from '@ant-design/pro-descriptions';
import { Divider } from 'antd';
import type { FC } from 'react';
import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import { useIntl } from 'umi';

interface Props {
  currentRow: MerchantDepositItem;
}

const FiatDepositFiatPayment: FC<Props> = ({ currentRow }) => {
  const t = useIntl();

  return (
    <>
      <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
        {t.formatMessage({ id: 'trxn.paymentInfo' })}
      </Divider>
      <ProDescriptions<MerchantDepositItem>
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
    </>
  );
};

export default FiatDepositFiatPayment;
