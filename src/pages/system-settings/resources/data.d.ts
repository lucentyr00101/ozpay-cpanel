export type ResourceItem = {
  id: string;
  key: number;
  name: string;
  type: string;
  router: string;
  sort: number;
  status?: string;
  remark?: string;
  children?: any;
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
