import type { DictionaryForm, DictionaryTypeForm } from '@/components/System-settings/ValuesForm';
import { request } from 'umi';
import type { DictionaryType, DictionaryValuesItem } from './data';

export async function fetchDictionaryList(
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
    data: DictionaryType[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
    totalElements?: number;
  }>('sysDictType/search', requestOptions);

  res.total = res.totalElements;

  return res;
}

// export async function dictionaryValues(
//   params: {
//     // query
//     /** 当前的页码 */
//     current?: number;
//     /** 页面的容量 */
//     pageSize?: number;
//   },
//   options?: Record<string, any>,
// ) {
//   return request<{
//     data: DictionaryValuesItem[];
//     /** 列表的内容总数 */
//     total?: number;
//     success?: boolean;
//   }>('/api/dictionary/values', {
//     method: 'GET',
//     params: {
//       ...params,
//     },
//     ...(options || {}),
//   });
// }

// TYPE DICTIONARY

export async function getDictionaryTypeList() {
  return request<{
    data: DictionaryType[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysDictType/all', {
    method: 'GET',
  });
}

export async function getDictionaryByCode(code: string) {
  return request<{
    data: DictionaryType;
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysDictType/detailByCode', {
    method: 'GET',
    params: {code}
  });
}

export async function addDictionaryType(data: DictionaryTypeForm) {
  return request<any>('sysDictType/add', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateDictionaryType(data: DictionaryTypeForm) {
  return request<any>('sysDictType/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function deleteDictionaryType(data: { id: string }) {
  return request<any>('sysDictType/delete', {
    method: 'DELETE',
    data,
  });
}

export async function deleteDictData(data: { id: string }) {
  return request<any>('sysDictData/delete', {
    method: 'DELETE',
    data,
  });
}

export async function getDictionaryData(params: { code: string; name: string; id: string }) {
  return request<{
    data: DictionaryType;
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysDictType/detail', {
    method: 'GET',
    params,
    skipErrorHandler: true,
  });
}

export async function getDictionaryList() {
  return request<{
    data: DictionaryType[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('sysDictData/all', {
    method: 'GET',
    skipErrorHandler: true,
  });
}

export async function addDictionaryData(data: DictionaryForm) {
  return request<any>('sysDictData/add', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateDictionaryData(data: DictionaryForm) {
  return request<any>('sysDictData/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function deleteDictionaryData(data: { id: string }) {
  return request<any>('sysDictData/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
  });
}

export async function getDictionaryValues(data: { id: string; name?: string; code?: string }) {
  const res = await request<{
    data: DictionaryValuesItem[];
    total?: number;
    success?: boolean;
    totalElements: number;
  }>('sysDictData/search', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
  res.total = res.totalElements;
  return res;
}
