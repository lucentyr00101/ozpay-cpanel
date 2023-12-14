export type PrivatemsgItem = {
  key: number;
  message: string;
  recipent: string;
  deliveredTime: number;
  sender: string;
  status: string;
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
