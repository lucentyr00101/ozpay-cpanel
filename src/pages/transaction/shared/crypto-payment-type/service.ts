import { request } from 'umi';
import type { CryptoPaymentItem } from './data';

export async function getCryptoPaymentTypes(type: string) {
  // params: {
  //     // query
  //     /** 当前的页码 */
  //     current?: number;
  //     /** 页面的容量 */
  //     pageSize?: number;
  // },
  // options?: Record<string, any>,
  const res = await request<{
    data: CryptoPaymentItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>(`paymentType/crypto/all?transaction=${type}`, {
    method: 'GET',
    // params: {
    //   ...params,
    // },
    // ...(options || {}),
  });

  return res;
}

export async function cryptoAddPaymentType(data: any) {
  return request<any>('paymentType/crypto/add', {
    method: 'POST',
    skipErrorHandler: true,
    body: data,
  });
}

export async function cryptoUpdatePaymentType(data: any) {
  return request<any>('paymentType/crypto/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function cryptoUploadPaymentTypeLogo(data: { file: string }) {
  return request<any>('paymentType/crypto/upload', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function cryptoDeletePaymentType(data: { id: string }) {
  return request<any>('paymentType/delete', {
    method: 'DELETE',
    skipErrorHandler: true,
    data,
  });
}
