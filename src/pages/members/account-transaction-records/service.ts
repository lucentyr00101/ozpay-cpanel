import { request } from 'umi';
import type { AccountTransactionRecordItem } from './data';

export async function fetchMemberAccountTransactionRecords(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  const res = await request<{
    data: AccountTransactionRecordItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('accountTransactionRecord/member/search', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });

  res.total = res.totalElements;

  return res;
}


export async function fetchMemberAccountTransactionRecordExport(
    params: {
      size?: number;
      page?: number;
    },
    options?: Record<string, any>,
  ) {
    const res = await request<{
      data: AccountTransactionRecordItem[];
      /** 列表的内容总数 */
      total?: number;
      success?: boolean;
      totalElements?: number;
    }>('accountTransactionRecord/member/export', {
      method: 'POST',
      responseType: 'blob',
      data: {
        ...params,
      },
      ...(options || {}),
    });
  
    res.total = res.totalElements;
  
    return res;
  }