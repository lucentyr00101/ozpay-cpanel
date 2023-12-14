// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
export type logoItem = {
  key: number;
  logo: string;
};

/** 获取当前的用户 GET /api/me */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('auth/me', {
    method: 'GET',
    ...(options || {}),
    skipErrorHandler: true,
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin() {
  return request<Record<string, any>>('auth/logout', {
    method: 'POST',
  });
}

/** 登录接口 POST auth/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    skipErrorHandler: true,
    ...(options || {}),
  });
}
/** 登录接口 GET auth/qrImage */
export async function getQRImg(body: API.QRImgParams, token: string) {
  return request<any>('sysUser/qrImage', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: body,
  });
}

/** 登录接口 POST auth/verify */
export async function verifyCode(body: API.verifyCode, token: string) {
  return request<API.VerifyCodeResult>('auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: body,
    skipErrorHandler: true,
  });
}

/** 登录接口 POST auth/verify */
export async function verifyCodeWithToken(body: API.verifyCode) {
  return request<API.VerifyCodeResult>('auth/verify', {
    method: 'POST',
    data: body,
    skipErrorHandler: true,
  });
}

export async function refreshToken(refreshToken: string) {
  return request('auth/refreshToken', {
    method: 'POST',
    data: { refreshToken },
    skipErrorHandler: true,
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getLogo() {
  return await request<{
    data: logoItem;
    success?: boolean;
  }>('sysFileInfo/logoSetting/public', {
    method: 'GET',
    skipErrorHandler: true,
  });
}
