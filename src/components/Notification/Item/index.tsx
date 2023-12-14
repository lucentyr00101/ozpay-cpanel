import type { FC } from 'react';
import type { NotificationItem } from '@/components/RightContent/Notification/data.d';
import './index.less';
import { ClockCircleFilled } from '@ant-design/icons';
import { history, useIntl } from 'umi';
import { readNotif, pollWithdrawalNotif } from '@/components/RightContent/Notification/service';

interface Props {
  data: NotificationItem;
  setNotifications: any;
}

const _NotificationItem: FC<Props> = ({ data, setNotifications }) => {
  const t = useIntl();
  const { id, orderId, createdTime, transactionGroup } = data;
  const message = t.formatMessage({ id: 'modal.withdrawalTrans' });

  const handleClick = async () => {
    const _data = {
      id,
      readMessage: 'Yes',
    };
    await readNotif(_data);
    const { data: res } = await pollWithdrawalNotif();
    setNotifications([...res.data] || []);
    const funcs = {
      Member: () =>
        history.push({
          pathname: '/member-transaction/withdrawal',
          query: { id: orderId },
        }),
      Merchant: () =>
        history.push({
          pathname: '/merchant-transaction/withdrawal',
          query: { id: orderId },
        }),
    };
    funcs[transactionGroup]();
  };

  return (
    <div
      className={`notification_item ${data.readMessage === 'Yes' && 'read'}`}
      onClick={() => handleClick()}
    >
      <p className="notification_item_text">
        {t.formatMessage({ id: 'table.orderID' })} {orderId}:
      </p>
      <p className="notification_item_text">
        {message}&nbsp;
        <span className="notification_item_text notification_item_text--under-review">
          {t.formatMessage({ id: 'table.Under Review' })}
        </span>
      </p>
      <p className="notification_item_text notification_item_text--date">
        <ClockCircleFilled style={{ fontSize: '10px', marginRight: '5px' }} />
        {createdTime}
      </p>
    </div>
  );
};

export default _NotificationItem;
