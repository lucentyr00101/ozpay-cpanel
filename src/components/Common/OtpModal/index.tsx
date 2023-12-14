import { ModalForm, ProFormText } from '@ant-design/pro-form';
import type { FC } from 'react';
import { useIntl } from 'umi';

interface Props {
  visible: boolean;
  close: () => void;
  verify: (code: string) => any;
}

const OtpModal: FC<Props> = ({ visible, close, verify }) => {
  const t = useIntl();

  const handleSubmit = async (values: any) => {
    const { code } = values;
    await verify(code);
  };

  return (
    <ModalForm
      visible={visible}
      width={400}
      onFinish={handleSubmit}
      modalProps={{
        centered: true,
        destroyOnClose: true,
        onCancel: close,
        closable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
        },
      }}
    >
      <p style={{ fontWeight: 500, fontSize: '16px', marginBottom: '30px' }}>
        {t.formatMessage({ id: 'modal.OTPVerification' })}
      </p>
      <ProFormText
        name="code"
        fieldProps={{
          maxLength: 6,
        }}
        rules={[
          { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
          { pattern: /^[0-9]+$/, message: t.formatMessage({ id: 'messages.numeric' }) },
        ]}
      />
    </ModalForm>
  );
};

export default OtpModal;
