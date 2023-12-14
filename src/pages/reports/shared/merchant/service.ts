import { request } from 'umi';
import type { MerchantReportItem } from './data';


export async function fetchMerchantTransactionReports(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<{
    data: MerchantReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/merchant/transaction', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function fetchMerchantReports(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<{
    data: MerchantReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/merchant', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function fetchMemberTRXMerchantExport(
  params: {
    // query
    /** 当前的页码 */
    page?: number;
    /** 页面的容量 */
    size?: number;
  },
  options?: Record<string, any>,
) {
  return request<{
    data: MerchantReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/merchant/export', {
    method: 'POST',
    responseType: 'blob',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}