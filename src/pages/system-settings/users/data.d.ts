export type UserItem = {
  id: string;
  name: string;
  username: string;
  userType: string;
  grantedRoles: any;
  status: string;
  ipWhitelist?: string;
  remarks?: string;
  createdTime: number;
  createdBy: string;
  remarks: string;
  merchants?: any;
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
