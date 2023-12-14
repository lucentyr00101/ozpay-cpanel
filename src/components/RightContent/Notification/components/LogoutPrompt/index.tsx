import type { FC } from 'react';
import { useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { useState } from 'react';
import { useIntl, history, useModel } from 'umi';
import { removeTokens } from '@/global';

interface Props {
  message: string;
  visible: boolean;
  logout: () => void;
}

const { Title } = Typography;

const LogoutPrompt: FC<Props> = ({ visible, message, logout }) => {
  const t = useIntl();
  const [remaining, setRemaining] = useState(5);
  const [intervalItem, setIntervalItem] = useState<any>();
  const { setInitialState } = useModel('@@initialState');

  const runTimer = () => {
    setRemaining((prevValue) => prevValue - 1);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e: any) {
      //remove cookies here
      setInitialState((s) => ({ ...s, currentUser: undefined } as any));
      removeTokens();
      history.replace('/user/login');
    }
  }

  useEffect(() => {
    if (remaining === 0) {
      setIntervalItem(undefined);
      clearInterval(intervalItem);
      handleLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  useEffect(() => {
    if (visible) {
      const timer = setInterval(() => {
        runTimer();
      }, 1000);
      setIntervalItem(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal destroyOnClose visible={visible} onCancel={undefined} footer={null} closable={false}>
      <Title level={3}>
      {message}{t.formatMessage({id: 'modal.autoLogout'})} {remaining} {t.formatMessage({id: 'modal.seconds'})}.
      </Title>
    </Modal>
  );
};

export default LogoutPrompt;
