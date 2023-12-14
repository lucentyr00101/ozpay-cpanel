import { request } from 'umi';
import type { PrivatemsgItem } from './data';
interface AddPayload {
  recipent: string;
  tag: string;
  message: string;
}

export async function privatemsg(
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
    data: PrivatemsgItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('/api/privatemsg', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getAllMsg(
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
    data: PrivatemsgItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('message/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;
  return res;
}

export async function addMsg(data: any) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: any;
    messages: string[];
  }>('message/add', {
    method: 'POST',
    data,
    params: {},
    skipErrorHandler: true,
  });
}

export async function deleteMsg(data: { id: string }) {
  return request<any>('message/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
  });
}

export async function upadteMsg(data: AddPayload) {
  return request<any>('message/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}
