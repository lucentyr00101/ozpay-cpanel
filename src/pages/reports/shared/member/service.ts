import { request } from 'umi';
import type { MemberReportItem } from './data';

export async function fetchMemberReports(
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
    data: MemberReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/member', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function fetchMemberTRXMemberExportReports(
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
    data: MemberReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/member/export', {
    method: 'POST',
    responseType: 'blob',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}