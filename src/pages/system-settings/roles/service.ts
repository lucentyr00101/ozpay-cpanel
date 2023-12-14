import type { RoleForm } from '@/components/System-settings/Role';
import { request } from 'umi';
import type { RoleItem } from './data';

// export async function role(
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
//     data: RoleItem[];
//     /** 列表的内容总数 */
//     total?: number;
//     success?: boolean;
//   }>('sysRole/pages', {
//     method: 'GET',
//     params: {
//       ...params,
//     },
//     ...(options || {}),
//   });
// }
export async function getRoleAll() {
  return request<{
    data: RoleItem[];
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('sysRole/all', {
    skipErrorHandler: true,
    method: 'GET',
  });
}

export async function getRoleList(
  params: {
    page?: number;
    size?: number;
  },
  options?: Record<string, any>,
) {
  return request<{
    data: RoleItem[];
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('sysRole/search', {
    skipErrorHandler: true,
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function addRole(data: RoleForm) {
  return request<any>('sysRole/add', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function updateRole(data: RoleForm) {
  return request<any>('sysRole/update', {
    method: 'PUT',
    skipErrorHandler: true,
    data,
  });
}

export async function deleteRole(data: { id: string }) {
  return request<any>('sysRole/delete', {
    method: 'DELETE',
    skipErrorHandler: true,
    data,
  });
}
