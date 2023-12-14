import { maxLength } from '@/global';
import { daysColoredMapping } from '@/pages/transaction/member/crypto-payment-type';
import type { CryptoPaymentItem } from '@/pages/transaction/shared/crypto-payment-type/data';
import { cryptoUpdatePaymentType } from '@/pages/transaction/shared/crypto-payment-type/service';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTimePicker,
  ProFormUploadButton,
} from '@ant-design/pro-form';
import { Button, Form, message, notification, Tag, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useIntl } from 'umi';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
  currentRow: CryptoPaymentItem | null;
}

const EditCryptoPaymentType: FC<Props> = ({ visible, close, reloadTable, currentRow }) => {
  const t = useIntl();
  const [fileHasError, setFileHasError] = useState(false);
  const [logoFile, setLogoFile] = useState({});
  const [form] = Form.useForm();
  const { Text } = Typography;

  const initialValues = {
    name: currentRow?.name,
    networkName: currentRow?.networkName,
    exchangeRate: currentRow?.exchangeRate,
    operatingHours: [
      currentRow?.operatingHours.split('-')[0],
      currentRow?.operatingHours.split('-')[1],
    ],
    repeat: currentRow?.repeatDays.split(','),
    file: [new File([], '')],
  };

  const showNotification = (notifMsg: string) => {
    notification.success({
      message: notifMsg,
      duration: 2,
    });
  };

  const isValidFile = (file: File) => {
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) {
      // message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
      return false;
    }
    return true;
  };

  const handleFailedValidation = ({ errorFields }: any) => {
    const emptyFile = errorFields.map((fields: any) => fields.name[0]).includes('file');
    if (emptyFile && !logoFile) setFileHasError(true);
    else {
      setFileHasError(false);
    }
  };

  const handleEditPaymentType = async (values: any) => {
    console.log({ values });
    try {
      const file = values.file && values.file[0] && values.file[0].originFileObj;
      console.log({ file });

      if ((file && isValidFile(file)) || values.file) {
        const [start, end] = values.operatingHours;
        const newForm = new FormData();
        if (values?.file?.length && file) {
          newForm.set('file', file as unknown as string);
        }
        newForm.set(
          'cryptoPaymentTypeUpdateParam',
          new Blob(
            [
              JSON.stringify({
                // id: currentRow.id,
                ...currentRow,
                name: values.name,
                networkName: values.networkName,
                exchangeRate: (+values.exchangeRate).toFixed(2),
                operatingHours: `${start}-${end}`,
                repeatDays: values.repeat
                  .map((item: string) => `${item.charAt(0).toUpperCase() + item.slice(1)}`)
                  .join(),
                // status: 'Enable',
                // transactionGroup: 'Merchant',
              }),
            ],
            { type: 'application/json' },
          ),
        );
        await cryptoUpdatePaymentType(newForm);
        showNotification(t.formatMessage({ id: 'messages.saved' }));
        close();
        reloadTable();
      }
    } catch (e: any) {
      console.log({ e });
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  useEffect(() => {
    setLogoFile([
      {
        uid: currentRow?.id || Math.floor(Math.random() * 1000000).toString(),
        name: currentRow?.name || 'image.png',
        status: 'done',
        url: currentRow?.logo,
      },
    ]);

    form.setFieldsValue({
      ...currentRow,
      file: {
        uid: currentRow?.id || Math.floor(Math.random() * 1000000).toString(),
        name: currentRow?.name || 'image.png',
        status: 'done',
        url: currentRow?.logo,
      },
    });
  }, [currentRow, form]);

  const handleFileUpload = (file: File) => {
    // const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    // if (isGreaterThan2MB) message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));

    form.setFieldsValue({ file });
    return false;
  };
  const handleRemoveLogo = () => {
    form.setFieldsValue({ file: null });
    setLogoFile(undefined as any);
  };

  return (
    <ModalForm
      title={t.formatMessage({ id: 'table.updateCryptoPayment' })}
      width={700}
      initialValues={initialValues}
      visible={visible}
      onFinish={handleEditPaymentType}
      onFinishFailed={handleFailedValidation}
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
        name="operatingHours"
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
      <ProFormUploadButton
        accept=".jpg,.jpeg,.png"
        name="file"
        label={t.formatMessage({ id: 'modal.uploadLogo' })}
        max={1}
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          beforeUpload: handleFileUpload,
          onRemove: handleRemoveLogo,
        }}
        fileList={logoFile}
        rules={[{ required: true, message: '' }]}
        title={t.formatMessage({ id: 'modal.upload' })}
        icon={<PlusOutlined />}
      />
      <Text type={fileHasError ? 'danger' : 'secondary'} className="upload-description">
        {t.formatMessage({ id: 'modal.uploaddesc' })}
      </Text>
    </ModalForm>
  );
};
export default EditCryptoPaymentType;
