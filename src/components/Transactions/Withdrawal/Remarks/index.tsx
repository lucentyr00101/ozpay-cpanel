import type { FC } from 'react';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { updateStatus } from '@/pages/transaction/shared/withdrawal/service';
import { useIntl } from 'umi';
import { notification } from 'antd';

interface Props {
  visible: boolean;
  close: () => void;
  id: string | undefined;
  closeGrandParent: () => void;
}

const WithdrawalRemarks: FC<Props> = ({ id, visible, close, closeGrandParent }) => {
  const t = useIntl();

  const showNotification = (message: string) => {
    notification.success({
      message,
      duration: 2,
    });
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      status: 'Rejected',
      id,
    };
    await updateStatus(data);
    close();
    closeGrandParent();
    showNotification(t.formatMessage({ id: 'messages.saved' }));
  };

  return (
    <ModalForm
      visible={visible}
      title={t.formatMessage({ id: 'modal.depositrejectiontitle' })}
      onFinish={handleSubmit}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
          resetText: t.formatMessage({ id: 'modal.cancel' }),
        },
      }}
      modalProps={{
        onCancel: () => close(),
        destroyOnClose: true,
        centered: true,
      }}
    >
      <ProFormTextArea
        label={t.formatMessage({ id: 'modal.remarkslabel' })}
        name="remark"
        fieldProps={{
          autoSize: {
            minRows: 4,
            maxRows: 10,
          },
        }}
        rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
      />
    </ModalForm>
  );
};

export default WithdrawalRemarks;
