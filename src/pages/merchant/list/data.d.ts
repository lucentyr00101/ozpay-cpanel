export type MerchantItem = {
  key: number;
  id: string;
  balance: number;
  depositRate: string;
  maxWithdrawalLimit: number;
  minWithdrawalLimit: number;
  maxDepositLimit: number;
  minDepositLimit: number;
  minWithdrawalLimit: number;
  acceptTimeLimit: string;
  paymentTimeLimit: string;
  level: string;
  sysUser: {
    id: string;
    ipWhitelist: any;
    salt: any;
    status: string;
    username: string;
    createdBy: string;
    createdTime: string;
  };
  merchantFinance: {
    balance: number;
  };
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
