import { request } from 'umi';

interface MerchantAmount {
  merchantId?: string;
  createdTimeSort?: string;
  expirationTimeSort?: string;
}

export async function getCryptoPaymentTypes(data: any) {
  // params: {
  //     // query
  //     /** 当前的页码 */
  //     current?: number;
  //     /** 页面的容量 */
  //     pageSize?: number;
  // },
  // options?: Record<string, any>,
  const res = await request('withdrawal/merchantAmounts', {
    method: 'POST',
    body: data,
  });

  return res;
}

export async function getChargeRequests(data: MerchantAmount) {
  return request<any>('withdrawal/merchantAmounts', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function getChargeRequestsByAdmin(data?: MerchantAmount) {
  return request<any>('withdrawal/merchantAmounts', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function cryptoChargeRequest(data: any) {
  return request<any>('withdrawal/merchantToMerchant/crypto/add', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}
export async function fiatChargeRequest(data: any) {
  return request<any>('withdrawal/merchantToMerchant/add', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function payChargeRequest(data: {
  withdrawalId: string;
  merchantId: string;
  receipt?: string;
  remark?: string;
}) {
  return request<any>('deposit/merchantToMerchant/add', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}
