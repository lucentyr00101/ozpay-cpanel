export type MemberItem = {
  id: string;
  key: number;
  merchant: string;
  member: string;
  createdBy: string;
  creationTime: string;
  status: string;
  action: any;
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
