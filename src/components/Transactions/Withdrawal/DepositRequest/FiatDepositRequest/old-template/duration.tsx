import ProDescriptions from '@ant-design/pro-descriptions';
import { Divider } from 'antd';
import type { FC } from 'react';
import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import { useIntl } from 'umi';

interface Props {
  currentRow: MerchantDepositItem;
}

const FiatDepositDuration: FC<Props> = ({ currentRow }) => {
  const t = useIntl();

  return (
    <>
      <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
        {t.formatMessage({ id: 'trxn.duration' })}
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
            title: t.formatMessage({ id: 'trxn.acceptedTimeLimit' }),
            dataIndex: ['withdrawal', 'acceptedTimeLimit'],
          },
          {
            title: t.formatMessage({ id: 'trxn.acceptedExpiredTime' }),
            dataIndex: 'acceptedExpiryTime',
            span: 2,
          },
          {
            title: t.formatMessage({ id: 'trxn.paymentTimeLimit' }),
            dataIndex: ['withdrawal', 'paymentTimeLimit'],
          },
          {
            title: t.formatMessage({ id: 'trxn.paymentExpiredTime' }),
            dataIndex: 'paymentExpiryTime',
            span: 2,
          },
        ]}
      />
    </>
  );
};

export default FiatDepositDuration;
