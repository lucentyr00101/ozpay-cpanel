import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Divider } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { getLocale, useIntl } from 'umi';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import { fetchStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';

interface Props {
  currentRow: MerchantDepositItem;
}

const FiatDepositOrderInfo: FC<Props> = ({ currentRow }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  return (
    <>
      <Divider orientation="left" orientationMargin="0" style={{ margin: '12px 0' }}>
        {t.formatMessage({ id: 'trxn.orderInfo' })}
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
            title: t.formatMessage({ id: 'trxn.merchant' }),
            dataIndex: ['merchant', 'username'],
          },
          {
            title: t.formatMessage({ id: 'trxn.fees' }),
            dataIndex: 'fee',
          },
        ]}
      />
      <ProDescriptions<MerchantDepositItem>
        column={3}
        title={false}
        request={async () => ({
          data: currentRow || {},
        })}
        params={{
          id: currentRow?.id,
        }}
        columns={[
          {
            title: t.formatMessage({ id: 'trxn.orderId' }),
            dataIndex: ['withdrawal', 'orderId'],
          },
          {
            title: t.formatMessage({ id: 'table.amount' }),
            dataIndex: ['withdrawal', 'amount'],
            render: (v: any) => v.toFixed(2),
          },
          {
            title: t.formatMessage({ id: 'table.status' }),
            dataIndex: ['withdrawal', 'status'],
            valueEnum: statusEnums,
          },
        ]}
      />
    </>
  );
};

export default FiatDepositOrderInfo;
