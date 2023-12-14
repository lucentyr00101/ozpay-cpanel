import type { ResourceForm } from '@/components/System-settings/EditResources';
import { request } from 'umi';
import type { ResourceItem } from './data';

export async function getResourceList(data: ResourceItem, options?: Record<string, any>) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: any;
  }>('sysResource/search', {
    method: 'POST',
    data,
    params: {},
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function resourceTree() {
  return request<any>('sysResource/tree', {
    method: 'GET',
  });
}

export async function getResourceAll() {
  return request<any>('sysResource/all', {
    method: 'GET',
  });
}

export async function updateResource(data: ResourceForm) {
  return request<any>('sysResource/update', {
    method: 'PUT',
    data,
  });
}

export async function restoreResource() {
  return request<any>('sysResource/restore', {
    method: 'POST',
  });
}

export async function deleteResource(data: { id: string }) {
  return request<any>('sysResource/delete', {
    method: 'DELETE',
    data,
  });
}
