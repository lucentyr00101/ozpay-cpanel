import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { isIP } from 'is-ip';
import { useState } from 'react';
import './index.less';
import { useIntl } from 'umi';

interface Values {
  title: string;
  description: string;
  modifier: string;
}

interface CollectionCreateFormProps {
  ipAddress?: string;
  visible: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const IPAddress: React.FC<CollectionCreateFormProps> = ({
  ipAddress,
  visible,
  onCreate,
  onCancel,
}) => {
  const t = useIntl();
  const [form] = Form.useForm();

  const [hasInvalidIPAddress, setHasInvalidIPAddress] = useState(false);
  const [ipAddressCount, setIpAddressCount] = useState(0);

  const handleIPAddress = ({ target: { value } }: any) => {
    const ipAddresses = value && value.trim() && value.split(',');

    setHasInvalidIPAddress(true);
    if (ipAddresses && ipAddresses.length) {
      const hasInvalid = ipAddresses.some((_ipAddress: any) => !isIP(_ipAddress.trim()));

      setIpAddressCount(ipAddresses.filter((_ipAddress: any) => isIP(_ipAddress.trim())).length);

      setHasInvalidIPAddress(hasInvalid);
    }
  };

  useEffect(() => {
    setHasInvalidIPAddress(false)
    form.setFieldsValue({ ipAddress: ipAddress || '' });
    const ipAddresses = ipAddress && ipAddress.trim() && ipAddress.split(',');
    setIpAddressCount(ipAddresses ? ipAddresses.filter((_ipAddress: any) => isIP(_ipAddress.trim())).length : 0);
  }, [ipAddress, form, visible]);

  return (
    <Modal
      visible={visible}
      title={t.formatMessage({ id: 'modal.ipWhitelist' })}
      okText={t.formatMessage({ id: 'modal.confirm' })}
      cancelText={t.formatMessage({ id: 'modal.cancel' })}
      onCancel={onCancel}
      width={500}
      onOk={() => {
        if (ipAddressCount <= 10 && !hasInvalidIPAddress) {
          form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
        }
      }}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
        <Form.Item
          name="ipAddress"
          hasFeedback
          validateStatus={hasInvalidIPAddress || ipAddressCount ? 'error' : undefined}
          help={
            hasInvalidIPAddress
              ? t.formatMessage({ id: 'modal.invalid1' })
              : ipAddressCount > 10
              ? t.formatMessage({ id: 'modal.invalid2' })
              : void 0
          }
        >
          <TextArea
            id="error"
            placeholder={t.formatMessage({ id: 'modal.error' })}
            rows={8}
            onChange={handleIPAddress}
            showCount={{ formatter: () => `${ipAddressCount}/10` }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IPAddress;
