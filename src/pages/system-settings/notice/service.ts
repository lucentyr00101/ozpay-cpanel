import { request } from 'umi';
import type { NoticeItem } from './data';
interface AddPayload {
  sysUserId: string;
  content: string;
  sort: number;
  id: string;
  status: string;
}

export async function getAllNotice(
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
    data: NoticeItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('notice/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;
  return res;
}

export async function addNotice(data: any) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: any;
    messages: string[];
  }>('notice/add', {
    method: 'POST',
    data,
    params: {},
    skipErrorHandler: true,
  });
}

export async function upadteNotice(data: AddPayload) {
  return request<any>('notice/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function deleteNotice(data: { id: string }) {
  return request<any>('notice/delete', {
    method: 'DELETE',
    data,
  });
}
