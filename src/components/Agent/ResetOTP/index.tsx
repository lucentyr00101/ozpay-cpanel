import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { useIntl } from 'umi';
import { Validator } from '@/global';
import { ExclamationCircleOutlined } from '@ant-design/icons';
interface Values {
  title: string;
  description: string;
  modifier: string;
}

interface CollectionCreateFormProps {
  error: string;
  visible: boolean;
  onCreate: (values: Values) => any;
  onCancel: () => void;
  title: string;
  type: string;
}

const ResetOTP: React.FC<CollectionCreateFormProps> = ({
  error,
  visible,
  onCreate,
  onCancel,
  title,
  type,
}) => {
  const t = useIntl();
  const [form] = Form.useForm();
  const [hasInputError, setHasInputError] = useState(false);
  const [okButtonDisabled, setOkButtonDisabled] = useState(true);

  const handleSubmit = (values: any) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: t.formatMessage({ id: 'modal.confirmmsg' }),
      okText: t.formatMessage({ id: 'modal.confirm' }),
      cancelText: t.formatMessage({ id: 'modal.cancel' }),
      onOk: async () => {
        await onCreate(values);
        setHasInputError(false);
        form.resetFields();
      },
    });
  };

  return (
    <Modal
      visible={visible}
      title={title}
      okText={t.formatMessage({ id: 'modal.confirm' })}
      cancelText={t.formatMessage({ id: 'modal.cancel' })}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okButtonProps={{ disabled: okButtonDisabled }}
      width={500}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            setHasInputError(false);
            form.resetFields();
            handleSubmit({
              ...values,
              qrImageType: type,
            });
          })
          .catch((info) => {
            setHasInputError(true);
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item
          name="code"
          label={t.formatMessage({ id: 'modal.OTPcode' })}
          rules={[
            {
              validator: (_, value: any) => {
                if (value.length > 0) {
                  setOkButtonDisabled(false);
                  return Promise.resolve();
                }
                setOkButtonDisabled(true);
                return Promise.reject();
              },
              required: true,
              message: t.formatMessage({ id: 'modal.errmsg' }),
            },
            Validator.NUMERIC_ONLY(),
          ]}
        >
          <Input />
        </Form.Item>
      </Form>

      {error && !hasInputError && <span className="otp-error">{error}</span>}
    </Modal>
  );
};

export default ResetOTP;
