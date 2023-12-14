import { request } from 'umi';

export type NoticeItem = {
  key: number;
  content: string;
  sort: number;
  status: boolean;
};

export async function getAllNotice() {
  const res = await request<{
    data: NoticeItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('notice/all', {
    method: 'GET',
  });
  return res;
}

export async function getNotices(data: any) {
  const res = await request<{
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('notice/search', {
    method: 'POST',
    data,
  });
  return res;
}
