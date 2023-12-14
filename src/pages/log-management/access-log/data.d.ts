export type AccessLogItem = {
  key: number;
  username: string;
  type: string;
  success: string;
  createdAt: number;
  os: string;
  ua: string;
  remark: string;
  ip: string;
  id: string;
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
