import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormUploadButton } from '@ant-design/pro-form';
import { useIntl } from 'umi';
import type { FC } from 'react';
import { useState } from 'react';
import { addPaymentType } from '@/pages/transaction/shared/fiat-payment-type/service';
import { notification, message, Space, Typography } from 'antd';
import './index.less';
import { maxLength } from '@/global';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
}

const AddPaymentType: FC<Props> = ({ visible, close, reloadTable }) => {
  const t = useIntl();
  const [fileHasError, setFileHasError] = useState(false);

  const { Text } = Typography;

  const showNotification = (notifMsg: string) => {
    notification.success({
      message: notifMsg,
      duration: 2,
    });
  };

  const isValidFile = (file: File) => {
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) {
      message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
      return false;
    }
    return true;
  };

  const handleAddPaymentType = async (values: any) => {
    console.log({values})
    try {
      const file = values.file[0].originFileObj;
      if (isValidFile(file)) {
        const newForm = new FormData();
        newForm.set('file', file as unknown as string);
        newForm.set(
          'paymentTypeAddParam',
          new Blob(
            [
              JSON.stringify({
                name: values.paymentType,
                tag: values.tag,
                status: 'Enable',
                transactionGroup: 'Member'
              }),
            ],
            { type: 'application/json' },
          ),
        );
        await addPaymentType(newForm);
        message.success(t.formatMessage({ id: 'messages.paymentTypeAdd' }));
        close();
        reloadTable();
      }
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const handleFailedValidation = ({ errorFields }: any) => {
    const emptyFile = errorFields.map((fields: any) => fields.name[0]).includes('file');
    if (emptyFile) setFileHasError(true);
    else setFileHasError(false);
  };

  const handleFileUpload = (file: File) => {
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
    return false;
  };

  return (
    <ModalForm
      width={700}
      title={t.formatMessage({ id: 'modal.addPayment' })}
      visible={visible}
      onFinish={handleAddPaymentType}
      onFinishFailed={handleFailedValidation}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
        },
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          close();
          setFileHasError(false);
        },
        centered: true,
      }}
    >
      <ProFormText
        name="paymentType"
        label={t.formatMessage({ id: 'modal.addpaymentType' })}
        placeholder={t.formatMessage({ id: 'modal.addpaymentTypedesc' })}
        fieldProps={{
          maxLength: maxLength.NAME,
        }}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'modal.addpaymentTypeerr' }),
          },
        ]}
      />
      <ProFormText
        name="tag"
        label={t.formatMessage({ id: 'modal.tag' })}
        placeholder={t.formatMessage({ id: 'modal.tag' })}
        rules={[{ required: true, message: t.formatMessage({ id: 'modal.tagerr' }) }]}
        fieldProps={{
          maxLength: maxLength.TAG,
        }}
      />
      <Space align="start">
        <ProFormUploadButton
          accept=".jpg,.jpeg,.png"
          name="file"
          label={t.formatMessage({ id: 'modal.uploadLogo' })}
          max={1}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
            beforeUpload: handleFileUpload,
          }}
          rules={[{ required: true, message: '' }]}
          title={t.formatMessage({ id: 'modal.upload' })}
          icon={<PlusOutlined />}
        />
        <Text type={fileHasError ? 'danger' : 'secondary'} className="upload-description">
          {t.formatMessage({ id: 'modal.uploaddesc' })}
        </Text>
      </Space>
    </ModalForm>
  );
};

export default AddPaymentType;
