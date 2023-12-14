import { request } from 'umi';
import type { MemberItem } from './data';

export async function getMemberList(
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
    data: MemberItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('member/search', requestOptions);

  res.total = res.totalElements;

  return res;
}

export async function updateMember(data: MemberItem) {
  return request<any>('member/update', {
    method: 'PUT',
    data,
  });
}

export async function resetPasswordMember(data: { password: string; id: string }) {
  return request<any>('member/resetPassword', {
    method: 'PUT',
    data,
  });
}
