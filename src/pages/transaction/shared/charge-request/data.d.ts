export type ChargeRequestItem = {
  key: number;
  id: string;
  orderId: number;
  amount: number;
  paymentType: string;
  createdTime: string;
  expirationTime: string;
  remark: string;
  merchant?: any;
  paymentExpiredTime?: any;
  acceptedExpiredTime?: any;
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
