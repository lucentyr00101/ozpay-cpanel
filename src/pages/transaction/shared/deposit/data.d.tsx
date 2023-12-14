export type DepositItem = {
  key: number;
  id: string;
  merchant: string;
  member: string;
  orderId: string;
  status: string;
  paymentType: string;
  paymentInfo: string;
  bankName: string;
  accountName: string;
  accountNumber: number;
  paymentTimeLimit: string;
  paymentExpiredTime: number;
  amount: number;
  fee: number;
  createdBy: string;
  createdAt: number;
  ipAddressCreatedBy: string;
  createdAtRange: number[];
  lastUpdatedBy: string;
  lastUpdatedTime: number;
  ipAddresslastUpdatedBy: string;
  remarks: string;
  receipt?: any;
};

export type MerchantDepositItem = {
  key: number;
  id: string;
  createdTime: string;
  username: string;
  orderId: number;
  paymentExpiryTime: string;
  paymentType: string;
  paymentInfo: {
    bankName?: string;
    bankCard?: string;
    accountName?: string;
    accountNo?: string;
    cryptoPayment?: string;
    cryptoAddress?: string;
    cryptoAmount?: string;
  };
  amount: number;
  fee: number;
  remarks: string;
  status: string;
  finishedTime: string;
  exchangeRate: number;
  action: string;
  electronicReceipt: string;
  withdrawal?: any;
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
