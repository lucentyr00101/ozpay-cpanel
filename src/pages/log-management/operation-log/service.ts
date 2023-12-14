import { request } from 'umi';
import type { OperationLogItem } from './data';

export async function fetchOperationLogs(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  const requestOptions = {
    method: 'POST',
    data: params,
    ...(options || {}),
  };

  const res = await request<{
    data: OperationLogItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('sysOperationLog/search', requestOptions);

  res.total = res.totalElements;

  return res;
}

// export async function getOperationLogList() {
//   const requestOptions = {
//     method: 'POST',
//     data: params,
//     ...(options || {}),
//   };

//   return request<{
//     data: OperationLogItem[];
//     /** 列表的内容总数 */
//     total?: number;
//     success?: boolean;
//     totalElements?: number;
//   }>('sysOperationLog/search', requestOptions);
// }
