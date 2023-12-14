import React, { useState } from 'react';
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

const Resetpassword: React.FC<CollectionCreateFormProps> = ({ visible, onCreate, onCancel }) => {
  const t = useIntl();
  const [form] = Form.useForm();
  
  const [okButtonDisabled, setOkButtonDisabled] = useState(true);
  return (
    <Modal
      visible={visible}
      title={t.formatMessage({ id: 'modal.resetPassword' })}
      okText={t.formatMessage({ id: 'modal.confirm' })}
      onCancel={()=> {
        setOkButtonDisabled(true);
        form.resetFields();
        onCancel()
      }}
      okButtonProps={{ 
        disabled: okButtonDisabled
      }}
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
      <Form form={form} layout="vertical" name="basic" initialValues={{ modifier: 'public' }}>
        <Form.Item
          label={t.formatMessage({ id: 'modal.currentPassword' })}
          name="currentPassword"
          rules={[{ required: true, message: t.formatMessage({ id: 'messages.currPassworderr' }) }]}
        >
          <Input.Password
            minLength={maxLength.PASSWORD_MIN_LENGTH}
            maxLength={maxLength.PASSWORD}
            placeholder={t.formatMessage({ id: 'modal.currentPassword' })}
            type="password"
          />
        </Form.Item>
      </Form>
      <Form form={form} layout="vertical" name="basic" initialValues={{ modifier: 'public' }}>
        <Form.Item
          label={t.formatMessage({ id: 'modal.newPassword' })}
          name="newPassword"
          rules={[
            { required: true, message: t.formatMessage({ id: 'messages.passworderr' }) },
            {
              min: maxLength.PASSWORD_MIN_LENGTH,
              message: t.formatMessage({ id: 'messages.newPasswordLengtherr' }),
            },
            { max: maxLength.PASSWORD, message: t.formatMessage({ id: 'messages.newPasswordLengtherr' }) },
            ({ getFieldValue }) => ({
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              validator(_, value) {
                if (getFieldValue('newPassword') === getFieldValue('confirmPassword') && getFieldValue('newPassword') !== '' && getFieldValue('confirmPassword') !== '' && getFieldValue('currentPassword') !== getFieldValue('newPassword')) {
                  setOkButtonDisabled(false);
                }
                if (getFieldValue('currentPassword') === getFieldValue('newPassword')) {
                  setOkButtonDisabled(true);
                  return Promise.reject(
                    new Error(
                      t.formatMessage({ id: 'messages.newPasswordCantSameCurrentPassworderr' }),
                    ),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password
            minLength={maxLength.PASSWORD_MIN_LENGTH}
            maxLength={maxLength.PASSWORD}
            placeholder={t.formatMessage({ id: 'modal.newPassword' })}
            type="password"
          />
        </Form.Item>
      </Form>
      <Form form={form} layout="vertical" name="basic" initialValues={{ modifier: 'public' }}>
        <Form.Item
          label={t.formatMessage({ id: 'modal.confirmPassword' })}
          name="confirmPassword"
          rules={[
            { required: true, message: t.formatMessage({ id: 'messages.passworderr' }) },
            {
              min: maxLength.PASSWORD_MIN_LENGTH,
              message: t.formatMessage({ id: 'messages.newPasswordLengtherr' }),
            },
            { max: maxLength.PASSWORD, message: t.formatMessage({ id: 'messages.newPasswordLengtherr' }) },
            ({ getFieldValue }) => ({
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              validator(_, value) {
                if (getFieldValue('newPassword') === getFieldValue('confirmPassword') && getFieldValue('newPassword') !== '' && getFieldValue('confirmPassword') !== '' && getFieldValue('currentPassword') !== getFieldValue('newPassword')) {
                  setOkButtonDisabled(false);
                }
                if (getFieldValue('newPassword') === getFieldValue('confirmPassword')) {
                  return Promise.resolve();
                }
                setOkButtonDisabled(true);
                return Promise.reject(
                  new Error(
                    t.formatMessage({ id: 'messages.passwordNotMatch' }),
                  ),
                );
              },
            }),
          ]}
        >
          <Input.Password
            minLength={maxLength.PASSWORD_MIN_LENGTH}
            maxLength={maxLength.PASSWORD}
            placeholder={t.formatMessage({ id: 'modal.confirmPassword' })}
            type="password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Resetpassword;
