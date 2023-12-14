import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormUploadButton } from '@ant-design/pro-form';
import { useIntl } from 'umi';
import type { FC} from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { updatePaymentType } from '@/pages/transaction/shared/fiat-payment-type/service';
import { notification, message, Space, Typography, Form } from 'antd';
import type { PaymentTypeItem } from '@/pages/transaction/shared/fiat-payment-type/data';
import { maxLength } from '@/global';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
  currentRow: PaymentTypeItem | null;
}

const EditPaymentType: FC<Props> = ({ visible, close, reloadTable, currentRow }) => {
  const t = useIntl();
  const [fileHasError, setFileHasError] = useState(false);
  const [form] = Form.useForm();

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
      // message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
      return false;
    }
    return true;
  };

  const handleEditPaymentType = async (values: any) => {
    try {
      const file = values.file && values.file[0] && values.file[0].originFileObj;
      if (file && isValidFile(file) || values.file) {
        const newForm = new FormData();
        if (values?.file?.length) {
          newForm.set('file', file as unknown as string);
        }
        newForm.set(
          'paymentTypeUpdateParam',
          new Blob(
            [
              JSON.stringify({
                ...currentRow,
                name: values.paymentType,
                tag: values.tag,
                // status: currentRow?.status,
                // id: currentRow?.id,
                // logo: currentRow?.logo,
              }),
            ],
            { type: 'application/json' },
          ),
        );
        await updatePaymentType(newForm);
        showNotification(t.formatMessage({ id: 'messages.saved' }));
        close();
        reloadTable();
      }
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const initialValues = {
    paymentType: currentRow?.name,
    tag: currentRow?.tag,
    file: [new File([], '')]
  };
  const [logoFile, setLogoFile] = useState({})

  const handleFailedValidation = ({ errorFields }: any) => {
    const emptyFile = errorFields.map((fields: any) => fields.name[0]).includes('file');
    if (emptyFile && (!logoFile)) setFileHasError(true);
    else {
      setFileHasError(false);
    }
  };

  const handleFileUpload = (file: File) => {
    // const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    // if (isGreaterThan2MB) message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
    
    form.setFieldsValue({file})
    return false;
  };


  useEffect(() => {
    setLogoFile([
      {
        uid: currentRow?.id || Math.floor(Math.random() * 1000000).toString(),
        name: currentRow?.name || 'image.png',
        status: 'done',
        url: currentRow?.logo,
      }
    ])
    
    form.setFieldsValue({...currentRow, file:   {
      uid: currentRow?.id || Math.floor(Math.random() * 1000000).toString(),
      name: currentRow?.name || 'image.png',
      status: 'done',
      url: currentRow?.logo,
    }})
  }, [currentRow, form])
  

  const handleRemoveLogo = () => {
    form.setFieldsValue({file: null})
    setLogoFile(undefined as any)
  }

  // form={form}

  return (
    <ModalForm
    width={700}
    initialValues={initialValues}
      title={t.formatMessage({ id: 'modal.editPayment' })}
      visible={visible}
      onFinish={handleEditPaymentType}
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
          onRemove:  handleRemoveLogo
        }}
          title={t.formatMessage({ id: 'modal.upload' })}
          icon={<PlusOutlined />}
          fileList={logoFile}
          rules={[{ required: true, message: '' }]}
        />
        <Text type={fileHasError ? 'danger' : 'secondary'} className="upload-description">
          {t.formatMessage({ id: 'modal.uploaddesc' })}
        </Text>
      </Space>
    </ModalForm>
  );
};

export default EditPaymentType;
