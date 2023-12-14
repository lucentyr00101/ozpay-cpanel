import { request } from 'umi';
import type { AgentReportItem } from './data';

export async function fetchAgentReports(
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
    data: AgentReportItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('report/agent/transaction', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}