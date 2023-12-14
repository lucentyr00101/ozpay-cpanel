import { request } from 'umi';
import type { AccessLogItem } from './data';

export async function fetchAccessLogs(
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
    data: AccessLogItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('sysAccessLog/search', requestOptions);

  res.total = res.totalElements;

  return res;
}

// export async function getAccessLogList() {
//   return request<{
//     data: AccessLogItem[];
//     /** 列表的内容总数 */
//     total?: number;
//     success?: boolean;
//   }>('sysAccessLog/all', {
//     method: 'GET',
//   });
// }
