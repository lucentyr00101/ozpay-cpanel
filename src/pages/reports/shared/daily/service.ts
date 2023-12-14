import { request } from 'umi';
import type { DailyReportItem } from './data';

export async function fetchDailyReports(
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
    data: DailyReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/daily', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function fetchDailyExportReports(
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
    data: DailyReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/daily/export', {
    method: 'POST',
    responseType: 'blob',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function fetchMerchantDailyReports(
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
    data: DailyReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/merchant/transaction/daily', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}
export async function fetchAgentDailyReports(
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
    data: DailyReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/agent/transaction/daily', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}
