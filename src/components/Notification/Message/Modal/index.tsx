import type { FC } from 'react';
import type { MessageItem } from '@/components/RightContent/Notification/data.d';
import { Modal } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import './index.less';
import { useIntl } from 'umi';

interface Props {
  data: MessageItem;
  visible: boolean;
  close: () => void;
}

const MessageModal: FC<Props> = ({ data, visible, close }) => {
  const t = useIntl();
  return (
    <Modal
      footer={null}
      visible={visible}
      destroyOnClose
      onCancel={close}
      closeIcon={<CloseCircleOutlined style={{ color: '#000', fontSize: '20px' }} />}
    >
      <div className="private-message">
        <div className="private-message-title">
          {t.formatMessage({ id: 'table.privateMessages' })}
        </div>
        <div className="private-message-date">{data.createdTime}</div>
        <div className="private-message-content">{data.message}</div>
      </div>
    </Modal>
  );
};

export default MessageModal;
