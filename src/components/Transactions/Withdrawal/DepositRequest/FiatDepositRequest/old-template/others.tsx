import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Divider } from 'antd';
import type { FC } from 'react';
import { useIntl } from 'umi';

interface Props {
  currentRow: MerchantDepositItem;
}

const FiatDepositOthers: FC<Props> = ({ currentRow }) => {
  const t = useIntl();

  return (
    <>
      <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
        {t.formatMessage({ id: 'trxn.others' })}
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
    </>
  );
};

export default FiatDepositOthers;
