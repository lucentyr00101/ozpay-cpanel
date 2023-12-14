import React from 'react';
import { Modal, Form, Input } from 'antd';
import { useIntl } from 'umi';
import { maxLength } from '@/global';
interface Values {
  title: string;
  description: string;
  modifier: string;
}

interface CollectionCreateFormProps {
  visible: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const ResetPassword: React.FC<CollectionCreateFormProps> = ({ visible, onCreate, onCancel }) => {
  const t = useIntl();
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title={t.formatMessage({ id: 'modal.resetPassword' })}
      okText={t.formatMessage({ id: 'modal.reset' })}
      cancelText={t.formatMessage({ id: 'modal.cancel' })}
      onCancel={onCancel}
      width={500}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
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
          name="password"
          label={t.formatMessage({ id: 'modal.newPassword' })}
          help={t.formatMessage({ id: 'modal.hintPassword' })}
          rules={[
            { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
            {
              min: maxLength.PASSWORD_MIN_LENGTH,
              message: `Password must have atleast ${maxLength.PASSWORD_MIN_LENGTH} characters.`,
            },
            {
              max: maxLength.PASSWORD,
              message: `Password must have a maximum of ${maxLength.PASSWORD} characters.`,
            },
          ]}
        >
          <Input.Password
            type="password"
            maxLength={maxLength.PASSWORD}
            minLength={maxLength.PASSWORD_MIN_LENGTH}
            placeholder={t.formatMessage({ id: 'modal.newPassword' })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResetPassword;
