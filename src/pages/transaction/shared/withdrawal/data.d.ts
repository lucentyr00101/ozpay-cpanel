export type WithdrawalItem = {
  id: string;
  key: number;
  merchant: string;
  member: string;
  orderId: string;
  status: string;
  paymentType: string;
  paymentInfo: string;
  bankName: string;
  accountName: string;
  accountNumber: number;
  acceptedTimeLimit: string;
  acceptedExpiredTime: number;
  paymentTimeLimit: string;
  paymentExpiredTime: number;
  amount: number;
  createdBy: string;
  createdAt: number;
  ipAddressCreatedBy: string;
  createdAtRange: number[];
  lastUpdatedBy: string;
  lastUpdatedTime: number;
  ipAddresslastUpdatedBy: string;
  remarks: string;
  receipt: string;
  action: string;
};

export type MerchantWithdrawalItem = {
  key: number;
  id: string;
  username: string;
  orderId: number;
  paymentType: string;
  status: string;
  amount: number;
  action: string;
  remark: string;
  paymentInfo: {
    bankName?: string;
    bankCard?: string;
    accountName?: string;
    accountNo?: string;
    cryptoPayment?: string;
    cryptoAddress?: string;
    cryptoAmount?: string;
  };
  createdTime: string;
  electronicReceipt: string;
};

export type Pagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type Params = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};
