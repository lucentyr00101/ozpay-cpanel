import { maxLength } from '@/global';
import { daysColoredMapping } from '@/pages/transaction/member/crypto-payment-type';
import { cryptoAddPaymentType } from '@/pages/transaction/shared/crypto-payment-type/service';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-form';
import { Button, Form, message, Tag } from 'antd';
import type { FC } from 'react';
import { useIntl } from 'umi';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
}
const AddCryptoPaymentType: FC<Props> = ({ visible, close, reloadTable }) => {
  const t = useIntl();

  const handleAddPaymentType = async (values: any) => {
    console.log({ values });
    try {
      const [start, end] = values.dateTimeRange;
      const newForm = new FormData();
      // console.log({
      //   name: values.paymentName,
      //   networkName: values.networkChain,
      //   exchangeRate: values.exchangeRate,
      //   operatingHours: 'Test',
      //   repeatDays: values.repeat,
      //   status: 'Enable',
      // })
      newForm.set('file', new File([new Blob([])], 'file.png'));
      newForm.set(
        'cryptoPaymentTypeAddParam',
        new Blob(
          [
            // HH:MM:SS-HH:MM:SS
            JSON.stringify({
              name: values.name,
              networkName: values.networkName,
              exchangeRate: (+values.exchangeRate).toFixed(2),
              operatingHours: `${start}-${end}`,
              repeatDays: values.repeat
                .map((item: string) => `${item.charAt(0).toUpperCase() + item.slice(1)}`)
                .join(),
              status: 'Enable',
              transactionGroup: 'Merchant',
            }),
          ],
          { type: 'application/json' },
        ),
      );
      await cryptoAddPaymentType(newForm);
      message.success(t.formatMessage({ id: 'messages.paymentTypeAdd' }));
      close();
      reloadTable();
    } catch (e: any) {
      console.log({ e });
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };
  return (
    <ModalForm
      title={t.formatMessage({ id: 'table.addCryptoPayment' })}
      width={700}
      visible={visible}
      onFinish={handleAddPaymentType}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
      submitter={{
        render: ({ submit }) => [
          <Button key="cancel" onClick={() => close()}>
            {t.formatMessage({ id: 'modal.cancel' })}
          </Button>,
          <Form.Item key="confirm" noStyle shouldUpdate>
            {({ getFieldsValue }) => {
              const fields = getFieldsValue();
              const invalidForm = Object.keys(fields).some((fieldName) => {
                if (
                  (fieldName === 'repeat' &&
                    fields[fieldName] !== undefined &&
                    fields[fieldName].length === 0) ||
                  fields[fieldName] === undefined ||
                  fields[fieldName] === null ||
                  fields[fieldName] === ''
                ) {
                  return true;
                }
                return false;
              });
              return (
                <Button type="primary" onClick={submit} disabled={invalidForm}>
                  {t.formatMessage({ id: 'modal.confirm' })}
                </Button>
              );
            }}
          </Form.Item>,
        ],
      }}
    >
      <ProFormText
        name="name"
        label={t.formatMessage({ id: 'modal.cryptoPaymentname' })}
        placeholder={t.formatMessage({ id: 'modal.addpaymentTypedesccrypto' })}
        fieldProps={{
          maxLength: maxLength.NAME,
        }}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'modal.cryptoPaymentNameErr' }),
          },
        ]}
      />
      <ProFormText
        name="networkName"
        label={t.formatMessage({ id: 'table.networkChain' })}
        placeholder={t.formatMessage({ id: 'modal.cryptoNetworkDesc' })}
        fieldProps={{
          maxLength: maxLength.NAME,
        }}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'modal.cryptoNetworkErr' }),
          },
        ]}
      />
      <ProFormDigit
        name="exchangeRate"
        label={t.formatMessage({ id: 'trxn.exchangeRate' })}
        placeholder={t.formatMessage({ id: 'trxn.exchangeRate' })}
        fieldProps={{
          maxLength: maxLength.NAME,
        }}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'modal.exchangeRateErr' }),
          },
        ]}
      />
      <ProFormTimePicker.RangePicker
        name="dateTimeRange"
        label={t.formatMessage({ id: 'table.operatingHours' })}
        placeholder={[
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ]}
        rules={[
          {
            required: true,
          },
        ]}
      />
      <ProFormSelect
        name="repeat"
        label={t.formatMessage({ id: 'table.repeat' })}
        valueEnum={{
          Monday: t.formatMessage({ id: 'table.Monday' }),
          Tuesday: t.formatMessage({ id: 'table.Tuesday' }),
          Wednesday: t.formatMessage({ id: 'table.Wednesday' }),
          Thursday: t.formatMessage({ id: 'table.Thursday' }),
          Friday: t.formatMessage({ id: 'table.Friday' }),
          Saturday: t.formatMessage({ id: 'table.Saturday' }),
          Sunday: t.formatMessage({ id: 'table.Sunday' }),
        }}
        fieldProps={{
          tagRender: (props) => {
            const { value, closable, onClose } = props;
            const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
              event.preventDefault();
              event.stopPropagation();
            };

            const { color, border, background } = daysColoredMapping[value];

            return (
              <Tag
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{
                  color: `${color}`,
                  background: `${background}`,
                  border: `1px solid ${border}`,
                  padding: '0 7px',
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              >
                {t.formatMessage({ id: `table.${value}` })}
              </Tag>
            );
          },
          mode: 'multiple',
        }}
        placeholder={t.formatMessage({ id: 'modal.pleaseSelect' })}
        rules={[
          {
            required: true,
            type: 'array',
          },
        ]}
      />
    </ModalForm>
  );
};
export default AddCryptoPaymentType;
