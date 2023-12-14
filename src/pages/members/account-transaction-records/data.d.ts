export type AccountTransactionRecordItem = {
    key: number;
    merchant: string;
    member?: { username: string };
    withdrawal?: member;
    orderId: string;
    transactionType: string;
    before: number;
    after: number;
    change: number;
    createdTime: DateTime;
  };
  
  export type Pagination = {
    total: number;
    pageSize: number;
    current: number;
  };
  
  