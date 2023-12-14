export type RoleItem = {
  id: string;
  key: number;
  name: string;
  code: string;
  sort: number;
  status: string;
  remark: string;
  sysResources?: string[];
  sysResourceChecks?: string[];
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
