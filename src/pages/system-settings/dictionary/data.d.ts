export type DictionaryItem = {
  sysDictTypeId: string;
  name: string;
  code: string;
  sort: number;
  status: string;
  remark: string;
};

export type DictionaryType = {
  id?: string;
  name: string;
  code: string;
  sort: number;
  status: string;
  remark: string;
  sysDictDataList?: any;
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

export type DictionaryValuesItem = {
  id: number;
  value: string;
  code: string;
  sort: number;
  remarks: string;
  status: string;
};
