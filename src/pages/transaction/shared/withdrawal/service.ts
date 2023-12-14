import { request } from 'umi';
import type { WithdrawalItem } from './data';

// Member
export async function getWithdrawalList(
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
    data: WithdrawalItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('withdrawal/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;

  return res;
}

export async function withdrawalDetails(data: any) {
  return request('withdrawal/detail', {
    method: 'GET',
    data,
  });
}

export async function addWithdrawal(data: any) {
  return request('withdrawal/add', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function addCryptoWithdrawal(data: any) {
  return request('withdrawal/crypto/add', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function fetchTemplate() {
  const locale = window.localStorage.getItem('umi_locale') !== 'zh-CN';
  const language = locale ? 'English' : 'Chinese';
  return request('withdrawal/excelTemplate?language=' + `${language}`, {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function fetchCryptoTemplate() {
  const locale = window.localStorage.getItem('umi_locale') !== 'zh-CN';
  const language = locale ? 'English' : 'Chinese';
  return request('withdrawal/crypto/excelTemplate?language=' + `${language}`, {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function importFile(data: any) {
  return request('withdrawal/import', {
    skipErrorHandler: true,
    method: 'POST',
    data,
  });
}

export async function importCryptoFile(data: any) {
  return request('withdrawal/crypto/import', {
    skipErrorHandler: true,
    method: 'POST',
    data,
  });
}

export async function updateStatus(data: any) {
  return request('withdrawal/status', {
    skipErrorHandler: true,
    method: 'PUT',
    data,
  });
}

export async function merchantWithdrawalSummary(data: any) {
  return request('withdrawal/merchantToMerchant/summary', {
    method: 'POST',
    data,
  });
}

// Merchant
export async function getMerchantsWithdrawalList(
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
    data: WithdrawalItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('withdrawal/merchantToMerchant/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;

  return res;
}

export async function getMerchantsWithdrawalExport(
  params: {
    // query
    size?: number;
    page?: number;
    fromDate?: string;
    toDate?: string;
  },
  options?: Record<string, any>,
) {
  const res = await request<{
    data: WithdrawalItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('withdrawal/merchantToMerchant/export', {
    method: 'POST',
    responseType: 'blob',
    data: params,
    ...(options || {}),
  });

  res.total = res.totalElements;

  return res;
}

export async function getAllWithdrawal() {
  return request('withdrawal/merchantToMerchant/all', {
    method: 'GET',
  });
}
