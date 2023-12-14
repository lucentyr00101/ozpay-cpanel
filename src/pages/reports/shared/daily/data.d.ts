export type DailyReportItem = {
  key: number;
  updatedTime: string;
  totalWithdrawalAmount: number;
  totalWithdrawalNumber: number;
  totalDepositAmount: number;
  totalDepositNumber: number;
  totalDepositFee: number;
  totalEarnings?: number;
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
