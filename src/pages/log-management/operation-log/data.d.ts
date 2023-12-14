export type OperationLogItem = {
  key: number;
  logId: string;
  module: string;
  opType: string;
  url: string;
  success: string;
  createdBy: string;
  createdTime: date;
  createdAtRange: number[];
  createdIp: string;
  // Hidden in table
  className: string;
  methodName: string;
  ua: string;
  requestMethod: string;
  parameters: string;
  result: string;
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
