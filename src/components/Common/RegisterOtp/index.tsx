import type { FC } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import './index.less';
import { Button, Col, Form, Row, message } from 'antd';
import { useIntl, useModel } from 'umi';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { getQRImg } from '@/services/ant-design-pro/api';
import Cookies from 'universal-cookie';

interface Props {
  visible: boolean;
  close: () => void;
  type: string;
  verify: (values: any) => any;
}

const ScanOTP: FC<Props> = ({ visible, close, type, verify }) => {
  const t = useIntl();
  const cookies = new Cookies();
  const [form] = Form.useForm();
  const { initialState, refresh } = useModel('@@initialState');
  const { currentUser } = (initialState as any) || {};
  const [image, setImage] = useState('');

  const handleSubmit = async (values: any) => {
    try {
      await verify(values.code);
      close();
      if (currentUser?.isResetTransactionOtp) {
        refresh();
      }
    } catch (e: any) {
      message.error(t.formatMessage({ id: 'messages.incorrectOtp' }));
    }
  };

  const titleDict = {
    Login: 'OTP 1',
    Transaction: 'OTP 2',
  };

  const fetchQr = async () => {
    const data = {
      username: currentUser?.username as string,
      qrImageType: type,
    };
    const token = cookies.get('auth_token');
    const { data: _image } = await getQRImg(data, token);
    setImage(_image);
  };

  useEffect(() => {
    if (visible) fetchQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <ModalForm
      onFinish={handleSubmit}
      form={form}
      visible={visible}
      submitter={false}
      grid
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
    >
      <div className="set-qr-container">
        <h3 style={{ marginBottom: '20px' }}>{titleDict[type]}</h3>
        {image && <h3>{t.formatMessage({ id: 'pages.authentication.qrCode' })}</h3>}

        {image && <img src={image} alt="QR Code" width={180} height={160} />}

        <p>{t.formatMessage({ id: 'pages.authentication.google' })}</p>
        <Row style={{ width: '100%' }} align="middle" justify="center">
          <Col span={18}>
            <ProFormText
              name="code"
              width="lg"
              fieldProps={{
                maxLength: 6,
              }}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                { pattern: /^[0-9]+$/, message: t.formatMessage({ id: 'messages.numeric' }) },
              ]}
            />
          </Col>
        </Row>
        <Row style={{ width: '100%' }} align="middle" justify="center">
          <Col span={18}>
            <Button type="primary" className="verify" block onClick={() => form.submit()}>
              {t.formatMessage({ id: 'pages.authentication.continue' })}
            </Button>
          </Col>
        </Row>
      </div>
    </ModalForm>
  );
};

export default ScanOTP;
