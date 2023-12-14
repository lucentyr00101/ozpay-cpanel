import type { UserForm } from '@/components/System-settings/User';
import { request } from 'umi';
import type { UserItem } from './data';

export interface IPWhitelistForm {
  id: string;
  ipWhitelist: string;
}
export interface resetOTPForm {
  username: string;
  code: string;
  qrImageType: string;
}
export interface resetPasswordForm {
  username: string;
  password: string;
  newPassword: string;
}

export async function getUserList() {
  return request<{
    data: UserItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysUser/all', {
    method: 'GET',
  });
}
// TODO: use /pages API when backend is ready
// export async function user(
//   params: {
//     // query
//     /** 当前的页码 */
//     page?: number;
//     /** 页面的容量 */
//     size?: number;
//   },
//   options?: Record<string, any>,
// ) {
//   return request<{
//     data: UserItem[];
//     /** 列表的内容总数 */
//     total?: number;
//     success?: boolean;
//   }>('sysUser/l', {
//     method: 'GET',
//     params: {
//       ...params,
//     },
//     ...(options || {}),
//   });
// }

export async function getUser(username: string, token?: string) {
  return await request<{
    data: UserItem;
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysUser/detail', {
    method: 'GET',
    params: { username },
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    skipErrorHandler: true,
  });
}

export async function addUser(data: UserForm) {
  return request<any>('sysUser/add', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateUser(data: UserForm) {
  return request<any>('sysUser/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function updateWhitelist(data: IPWhitelistForm) {
  return request<any>('sysUser/ipWhitelist', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function resetOTP(data: resetOTPForm) {
  return request<any>('sysUser/resetOtp', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function resetPassword(data: resetPasswordForm) {
  return request<any>('sysUser/resetPassword', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function fetchUsersSearch(
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
    data: UserItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysUser/search', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getUserType(data: any) {
  return request<any>('sysUser/userType', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}
