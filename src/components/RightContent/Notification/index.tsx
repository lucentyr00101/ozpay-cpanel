import { BellFilled } from '@ant-design/icons';
import { Badge, Dropdown, Menu, Tabs, Empty } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import useStateRef from 'react-usestateref';
import _NotificationItem from '@/components/Notification/Item';
import _MessageItem from '@/components/Notification/Message';
import './index.less';
import Websocket from '@/components/RightContent/Notification/websocket';
import { outLogin } from '@/services/ant-design-pro/api';
import { removeTokens } from '@/global';
import { useIntl, useModel } from 'umi';
import Cookies from 'universal-cookie';

const Notification: FC = () => {
  const cookies = new Cookies();
  const t = useIntl();
  const [notifications, setNotifications, notificationsRef] = useStateRef([]);
  const [messages, setMessages, messagesRef] = useStateRef([]);
  const [, setIntervalTimeout, intervalTimeoutRef] = useStateRef();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { setInitialState } = useModel('@@initialState');
  const unreadNotifs = notifications.filter((_notif: any) => _notif.readMessage === 'No');
  const unreadMessages = messages.filter((_msg: any) => _msg.readMessage === 'No');
  const notifCount = unreadNotifs.length + unreadMessages.length;

  const { TabPane } = Tabs;

  const menuClick = ({ domEvent: event }: any) => {
    // console.log(event);
    event.preventDefault();
    event.stopPropagation();
    return undefined;
  };

  const menu = (
    <Menu className="notif-menu" selectable={false} onClick={menuClick}>
      <Menu.Item key="menu-item-1">
        <Tabs defaultActiveKey="1" className="notif-tabs">
          <TabPane tab={t.formatMessage({ id: 'table.pending' })} key="1">
            <div className="notification">
              {notifications.length > 0 &&
                notifications.map((notif: any) => (
                  <_NotificationItem
                    key={notif.id}
                    data={notif}
                    setNotifications={setNotifications}
                  />
                ))}
              {notifications.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t.formatMessage({ id: 'table.noNotifications' })}
                />
              )}
            </div>
          </TabPane>
          <TabPane tab={t.formatMessage({ id: 'table.privateMessages' })} key="2">
            <div className="notification">
              {messages.length > 0 &&
                messages.map((message) => (
                  <_MessageItem key={message.id} data={message} setMessages={setMessages} />
                ))}
              {messages.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t.formatMessage({ id: 'table.noPrivateMessages' })}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Menu.Item>
    </Menu>
  );

  const logout = async () => {
    const authToken = cookies.get('auth_token');
    setInitialState((s) => ({ ...s, currentUser: undefined } as any));
    if (authToken) await outLogin();
    removeTokens();
    window.location.replace('/user/login');
  };

  const handleBellClick = (open: boolean) => {
    if (open) {
      clearInterval(intervalTimeoutRef.current);
      setIntervalTimeout(undefined);
    }
    setDropdownVisible(open);
  };

  return (
    <>
      <Websocket
        setNotifications={setNotifications}
        logout={async () => await logout()}
        setMessages={setMessages}
        messages={messagesRef}
        notifications={notificationsRef}
        setIntervalTimeout={setIntervalTimeout}
        intervalTimeout={intervalTimeoutRef}
        dropdownVisible={dropdownVisible}
      />
      <Badge count={notifCount}>
        <Dropdown onVisibleChange={handleBellClick} overlay={menu} trigger={['click']}>
          <BellFilled style={{ fontSize: '20px' }} />
        </Dropdown>
      </Badge>
    </>
  );
};

export default Notification;
