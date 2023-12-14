import { request } from 'umi';

export async function fetchDeposits(
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
    data: any;
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('deposit/merchantToMerchant/search', requestOptions);

  res.total = res.totalElements;

  return res;
}

export async function updateDeposit(data: any) {
  return await request('deposit/merchantToMerchant/update', {
    data,
    method: 'PUT',
    skipErrorHandler: true,
  });
}

export async function getAllDeposit() {
  return request('deposit/merchantToMerchant/all', {
    method: 'GET',
  });
}
