import React, { useEffect, useState } from 'react';
import './index.less';
import { Button, Form, Input } from 'antd';
import { useIntl } from 'umi';

const QRImg: React.FC<{ loading: boolean,  img: string; hasError: boolean; verify: any; backToLogin: any }> = ({
  img,
  verify,
  loading,
  backToLogin,
  hasError,
}) => {
  const t = useIntl();
  const [form] = Form.useForm();
  const [validForm, setValidForm] = useState(false);
  const checkForm = () => {
    const code = form.getFieldValue('code');
    if (code) {
      form
        .validateFields()
        .then(() => {
          setValidForm(true);
        })
        .catch(() => setValidForm(false));
    } else {
      setValidForm(false);
    }
  };

  const Validator = {
    NUMERIC_ONLY: { pattern: /^[0-9]+$/, message: t.formatMessage({ id: 'messages.numeric' }) },
    NUMERIC_DECIMAL: {
      pattern: /^\d+(\.\d{1,999})?$/,
      message: t.formatMessage({ id: 'messages.numeric' }),
    },
    MAX_99: {
      validator: (_, value: any) => {
        if (+value < 100) {
          return Promise.resolve();
        }

        return Promise.reject();
      },
      message: t.formatMessage({ id: 'messages.max99' }),
    },
    ALPHABET_ONLY: {
      pattern: /^[a-zA-Z]+$/,
      message: t.formatMessage({ id: 'messages.alphabet' }),
    },
    PASSWORD_NO_SYMBOL: {
      pattern: /^[a-zA-Z]+$/,
      message: t.formatMessage({ id: 'messages.symbol' }),
    },
    PASSWORD_ALPHA_NUM: { pattern: /^\w+$/, message: t.formatMessage({ id: 'messages.symbol' }) },
  };

  useEffect(() => {
    if (hasError) {
      form.setFieldsValue({ code: '' });
    }
  }, [hasError, form]);

  return (
    <div className="qr-container">
      {img && <h3>{t.formatMessage({ id: 'pages.authentication.qrCode' })}</h3>}

      {img && <img src={img} alt="QR Code" width={180} height={160} />}

      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
        onFinish={() => verify(form.getFieldValue('code'))}
      >
        <p>{t.formatMessage({ id: 'pages.authentication.google' })}</p>
        <Form.Item
          name="code"
          label={t.formatMessage({ id: 'pages.authentication.verificationCode' })}
          rules={[Validator.NUMERIC_ONLY]}
        >
          <Input onChange={checkForm} placeholder="123456" />
        </Form.Item>

        <Button
          type="primary"
          className="verify"
          disabled={!validForm || loading}
          block
          onClick={() => verify(form.getFieldValue('code'))}
        >
          {t.formatMessage({ id: 'pages.authentication.continue' })}
        </Button>
        <Button block onClick={backToLogin}>
          {t.formatMessage({ id: 'pages.authentication.backToLogin' })}
        </Button>
      </Form>
    </div>
  );
};

export default QRImg;
