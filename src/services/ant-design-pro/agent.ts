import { request } from 'umi';

export const fetchAgents = async (data: { page: number; size: number }) => {
  const res = await request<{
    data: any;
  }>('merchant/agent/search', {
    method: 'POST',
    data,
  });

  return res;
};
