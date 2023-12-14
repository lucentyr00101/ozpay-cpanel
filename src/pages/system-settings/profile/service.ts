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
  customerServiceUrl: string;
  depositRate: string;
  maxWithdrawalLimit: string;
  minWithdrawalLimit: string;
  maxDepositLimit: string;
  minDepositLimit: string;
}

export async function getMerchantList() {
  return await request<{
    data: MerchantItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('merchant/all', {
    method: 'GET',
  });
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
    ...(options || {}),
  });
}

export async function updateMerchant(data: AddPayload) {
  return request<any>('merchant/update', {
    method: 'PUT',
    data,
  });
}
