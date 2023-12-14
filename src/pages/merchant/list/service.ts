import { request } from 'umi';
import type { MerchantItem } from './data';

// export async function _merchant(
//   params: {
//     // query
//     /** 当前的页码 */
//     current?: number;
//     /** 页面的容量 */
//     pageSize?: number;
//   },
//   options?: Record<string, any>,
// ) {
//   return await request<{
//     data: MerchantItem[];
//     /** 列表的内容总数 */
//     total?: number;
//     success?: boolean;
//   }>('merchant/pages', {
//     method: 'GET',
//     params: {
//       page: params.current,
//       size: params.pageSize,
//     },
//     ...(options || {}),
//   });
// }

interface AddPayload {
  sysUser: {
    id: string;
    username: string;
    password: string;
    status: string;
  };
  level: string;
  customerServiceUrl: string;
  depositRate: string;
  maxWithdrawalLimit: string;
  minWithdrawalLimit: string;
  maxDepositLimit: string;
  minDepositLimit: string;
}

export async function getMerchantList(
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
  const res = await request<{
    data: MerchantItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('merchant/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
    skipErrorHandler: true
  });

  res.total = res.totalElements;
  return res;
}

export async function getAllMerchants() {
  const res = await request<{
    data: MerchantItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('merchant/all', {
    method: 'GET',
    skipErrorHandler: true
  });
  return res;
}

export async function addMerchant(data: AddPayload, options?: Record<string, any>) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: any;
    messages: string[];
  }>('merchant/add', {
    method: 'POST',
    data,
    params: {},
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getMerchant(id: string) {
  return request<any>('merchant/detail', {
    method: 'GET',
    params: { id },
    skipErrorHandler: true
  });
}
export async function updateMerchant(data: AddPayload) {
  return request<any>('merchant/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true
  });
}
