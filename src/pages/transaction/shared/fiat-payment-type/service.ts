import { request } from 'umi';
import type { PaymentTypeItem } from './data';

export async function getMemberPaymentTypeList(type: string) {
  // params: {
  //     // query
  //     /** 当前的页码 */
  //     current?: number;
  //     /** 页面的容量 */
  //     pageSize?: number;
  // },
  // options?: Record<string, any>,
  const res = await request<{
    data: PaymentTypeItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>(`paymentType/${type}/all?transaction=Member`, {
    method: 'GET',
    // params: {
    //   ...params,
    // },
    // ...(options || {}),
  });

  return res;
}
export async function getPaymentTypeList(type: string) {
  // params: {
  //     // query
  //     /** 当前的页码 */
  //     current?: number;
  //     /** 页面的容量 */
  //     pageSize?: number;
  // },
  // options?: Record<string, any>,
  const res = await request<{
    data: PaymentTypeItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>(`paymentType/all?transaction=${type}`, {
    method: 'GET',
    // params: {
    //   ...params,
    // },
    // ...(options || {}),
  });

  return res;
}
export async function getFiatPaymentTypeList(type: string) {
  // params: {
  //     // query
  //     /** 当前的页码 */
  //     current?: number;
  //     /** 页面的容量 */
  //     pageSize?: number;
  // },
  // options?: Record<string, any>,
  const res = await request<{
    data: PaymentTypeItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>(`paymentType/fiat/all?transaction=${type}`, {
    method: 'GET',
    // params: {
    //   ...params,
    // },
    // ...(options || {}),
  });

  return res;
}

export async function addPaymentType(data: any) {
  return request<any>('paymentType/add', {
    method: 'POST',
    skipErrorHandler: true,
    body: data,
  });
}

export async function updatePaymentType(data: any) {
  return request<any>('paymentType/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function uploadPaymentTypeLogo(data: { file: string }) {
  return request<any>('paymentType/upload', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function deletePaymentType(data: { id: string }) {
  return request<any>('paymentType/delete', {
    method: 'DELETE',
    skipErrorHandler: true,
    data,
  });
}
