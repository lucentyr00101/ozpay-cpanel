import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Divider } from 'antd';
import type { FC } from 'react';
import { useIntl } from 'umi';

interface Props {
  currentRow: MerchantDepositItem;
}

const FiatDepositReceipt: FC<Props> = ({ currentRow }) => {
  const t = useIntl();

  return (
    <>
      <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
        {t.formatMessage({ id: 'trxn.receipt' })}
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
  );
};

export default FiatDepositReceipt;
