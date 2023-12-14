import type { FC } from 'react';
import type { MessageItem } from '@/components/RightContent/Notification/data.d';
import './index.less';
import { Typography } from 'antd';
import { ClockCircleFilled } from '@ant-design/icons';
import MessageModal from './Modal';
import { useState } from 'react';
import { readMessage, pollPrivateMsgs } from '@/components/RightContent/Notification/service';

interface Props {
  data: MessageItem;
  setMessages: (values: any) => void;
}

const { Text } = Typography;

const _MessageItem: FC<Props> = ({ data, setMessages }) => {
  const { id, message, createdTime } = data;
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    const _data = {
      id,
      readMessage: 'Yes',
    };
    await readMessage(_data);
    setShowModal(true);
    const { data: res } = await pollPrivateMsgs();
    setMessages([...res.data] || []);
  };

  return (
    <>
      <div
        className={`notification_item ${data.readMessage === 'Yes' && 'read'}`}
        onClick={() => handleClick()}
      >
        <Text className="notification_item_text" ellipsis>
          {message}
        </Text>
        <p className="notification_item_text notification_item_text--date">
          <ClockCircleFilled style={{ fontSize: '10px', marginRight: '5px' }} />
          {createdTime}
        </p>
      </div>
      <MessageModal data={data} visible={showModal} close={() => setShowModal(false)} />
    </>
  );
};

export default _MessageItem;
