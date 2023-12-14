import { request } from 'umi';

export type WithdrawalStatusPercentageItem = {
    status: string;
    percentage: number;
};

export type MerchantLastSevenDaysItem = {
  updatedTime: string;
  dayOfWeek: string,
  totalWithdrawalAmount: number;
  totalDepositAmount: number;
  totalDepositFee: number;
  visitorNumberToday: number;
  totalEarnings?: number;
};

export type MerchantWithdrawlOrDepositAmountsItem = {
  updatedTime: string;
  dateRange: string,
  totalAmount: string,
};

export async function fetchWithdrawalStatusPercentage(
    params: {
      // query
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
      data: WithdrawalStatusPercentageItem[];
      /** 列表的内容总数 */
      // total?: number;
      success?: boolean;
      // totalElements?: number;
    }>('dashboard/agent/merchantWithdrawalsByStatus', requestOptions);
  
    // res.total = res.totalElements;
  
    return res;
  }

  export async function getAgentMerchantLastSevenDays() {
    return request<{
      data: MerchantLastSevenDaysItem[];
      /** 列表的内容总数 */
      // total?: number;
      success?: boolean;
    }>('dashboard/agent/merchantLastSevenDays', {
      method: 'GET',
      skipErrorHandler: true,
    });
  }

  // merchant
  export async function fetchAgentMerchantAmounts(
    params: {
      // query
      fromDate?: string;
      toDate?: string;
      dateRange?: string;
    },
    options?: Record<string, any>,
  ) {
    const requestOptions = {
      method: 'POST',
      data: params,
      ...(options || {}),
    };
  
    const res = await request<{
      data: MerchantWithdrawlOrDepositAmountsItem[];
      /** 列表的内容总数 */
      // total?: number;
      success?: boolean;
      // totalElements?: number;
    }>('dashboard/agent/merchantAmounts', requestOptions);
  
    // res.total = res.totalElements;
  
    return res;
  }

  export async function agentMerchantFinanceByMerchant() {
    return await request<{
      data: any;
      /** 列表的内容总数 */
      // total?: number;
      success?: boolean;
    }>('dashboard/agent/merchantFinanceByMerchant', {
      method: 'GET',
      skipErrorHandler: true,
    });
  }