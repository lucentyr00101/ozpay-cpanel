import { request } from 'umi';

export interface TopUpForm {
  merchantId: string;
  transactionType: string;
  amount: any;
  remark: string;
}

export async function submitTopUp(data: TopUpForm) {
  return request('accountTransactionRecord/topUp', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}
