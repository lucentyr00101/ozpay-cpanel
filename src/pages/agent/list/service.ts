import { request } from 'umi';
import type { ListItem } from './data';

interface AddPayload {
  sysUser: {
    id: string;
    username: string;
    password: string;
    status: string;
  };
  level: string;
  customerServiceUrl: string;
  depositRate: string;
  memberDepositRate: string;
  merchantDepositRate: string;
  maxWithdrawalLimit: string;
  minWithdrawalLimit: string;
  maxDepositLimit: string;
  minDepositLimit: string;
}

interface AgentStatusPayload {
  id: string;
  status: string;
}

export async function getAgentList(
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
    data: ListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('merchant/agent/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;
  return res;
}

export async function getAllMerchants() {
  const res = await request<{
    data: ListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('merchant/agent/all', {
    method: 'GET',
  });
  return res;
}

export async function addAgent(data: AddPayload, options?: Record<string, any>) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: any;
    messages: string[];
  }>('merchant/agent/add', {
    method: 'POST',
    data,
    params: {},
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getAgent(id: string) {
  return request<any>('merchant/agent/detail', {
    method: 'GET',
    params: { id },
  });
}
export async function updateAgent(data: AddPayload) {
  return request<any>('merchant/agent/update', {
    method: 'PUT',
    data,
  });
}

export async function updateAgentStatus(data: AgentStatusPayload) {
  return request<any>('sysUser/status', {
    method: 'PUT',
    data,
  });
}