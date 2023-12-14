import type { FC } from 'react';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { useIntl } from 'umi';

interface Props {
  visible: boolean;
  close: () => void;
  id: string | undefined;
  reject: (id: string, status: string, remark?: string) => void;
}

const WithdrawalRemarks: FC<Props> = ({ id, visible, close, reject }) => {
  const t = useIntl();

  const handleSubmit = async (values: any) => {
    await reject(id as string, 'Rejected', values.remark);
    close();
  };

  return (
    <ModalForm
      width={500}
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
