export type PaymentTypeItem = {
    id: string;
    logo?: string;
    name: string;
    status: string;
    tag: string;
  };
  export type PaymentTypeForm = {
    id?: string;
    file: File | null;
    paymentTypeAddParam: {
      name: string;
      tag: string;
      status: string;
      logo?: string;
    };
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
  