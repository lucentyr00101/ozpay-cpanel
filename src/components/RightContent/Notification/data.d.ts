export interface NotificationItem {
  id: string;
  orderId: string;
  status: string;
  createdTime: string;
  createdBy: string;
  updatedTime: string;
  updatedBy: string;
  transactionGroup: 'Merchant' | 'Member';
  readMessage: 'Yes' | 'No';
}

export interface MessageItem {
  id: string;
  unread: boolean;
  createdTime: string;
  message: string;
  readMessage: 'Yes' | 'No';
}
