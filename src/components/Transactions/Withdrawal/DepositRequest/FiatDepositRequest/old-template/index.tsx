import type { FC } from 'react';
import { useIntl } from 'umi';
import { Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-form';
import type { MerchantDepositItem } from '@/pages/transaction/shared/deposit/data.d';
import Duration from './duration';
import Others from './others';
import Receipt from './receipt';
import OrderInfo from './order-info';
import FiatPayment from './fiat-payment';
import CryptoPayment from './crypto-payment';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: MerchantDepositItem | undefined;
}

const MerchantDepositRequest: FC<Props> = ({ visible, close, currentRow }) => {
  const t = useIntl();

  let isCrypto = false;
  if (currentRow) {
    const { withdrawal } = currentRow || {};
    const { cryptoAddress, cryptoPayment, exchangeRate } = withdrawal;
    isCrypto = !!cryptoAddress && !!cryptoPayment && !!exchangeRate;
  }

  const submit = async () => {
    console.log('submit');
  };

  return (
    <ModalForm
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
            <Button type="primary" key="submit" onClick={submit}>
              {t.formatMessage({ id: 'modal.submit' })}
            </Button>,
          ];
        },
      }}
    >
      {currentRow?.id && (
        <>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Complete Deposit Request</p>
          <OrderInfo currentRow={currentRow} />
          {isCrypto && <CryptoPayment currentRow={currentRow} />}
          {!isCrypto && <FiatPayment currentRow={currentRow} />}
          <Duration currentRow={currentRow} />
          <Others currentRow={currentRow} />
          <Receipt currentRow={currentRow} />
        </>
      )}
    </ModalForm>
  );
};

export default MerchantDepositRequest;
