import { request } from 'umi';
import type { DepositItem } from './data.d';

export async function getDepositList(
  params: {
    // query
    size: number;
    page: number;
    merchantUsername?: string;
    fromDate?: string;
    toDate?: string;
  },
  options?: Record<string, any>,
) {
  const requestOptions = {
    method: 'POST',
    data: params,
    ...(options || {}),
  };

  const res = await request<{
    data: DepositItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('deposit/search', requestOptions);

  res.total = res.totalElements;

  return res;
}

export async function getMerchantsDepositExport(
  params: {
    // query
    size?: number;
    page?: number;
    fromDate?: string;
    toDate?: string;
  },
  options?: Record<string, any>,
) {
  const res = await request<{
    data: DepositItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('deposit/merchantToMerchant/export', {
    method: 'POST',
    responseType: 'blob',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;

  return res;
}

export async function merchantDepositSummary(data: any) {
  return request('deposit/merchantToMerchant/summary', {
    method: 'POST',
    data,
  });
}
