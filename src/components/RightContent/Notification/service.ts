import { request } from 'umi';

export const testWebsocket = async () => {
  return await request('websocket/send', {
    method: 'POST',
    data: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      orderId: '',
      status: '',
      createdTime: '',
      createdBy: '',
      updatedTime: '',
      updatedBy: '',
    },
  });
};

export async function pollSysNotif(id: string) {
  return await request<{
    data: any;
    /** 列表的内容总数 */
    // total?: number;
    success?: boolean;
  }>('sysUser/notification', {
    method: 'GET',
    params: {
      id,
    },
    skipErrorHandler: true,
  });
}

export async function pollWithdrawalNotif() {
  return await request<{
    data: any;
    /** 列表的内容总数 */
    // total?: number;
    success?: boolean;
  }>('withdrawal/notification', {
    method: 'GET',
    skipErrorHandler: true,
  });
}

export async function pollPrivateMsgs() {
  return await request<{
    data: any;
    /** 列表的内容总数 */
    // total?: number;
    success?: boolean;
  }>('message/notification', {
    method: 'GET',
    skipErrorHandler: true,
  });
}

export const poll = async ({ fn, validate, interval, maxAttempts = 1000, action }: any) => {
  let attempts = 0;

  const executePoll = async (resolve: any, reject: any) => {
    try {
      const result = await fn();
      attempts++;
      if (validate(result)) {
        if (action) action(result);
        setTimeout(executePoll, interval, resolve, reject);
        return resolve(result);
      } else if (maxAttempts && attempts === maxAttempts) {
        return reject(new Error('Exceeded max attempts'));
      } else {
        return reject(new Error(result));
      }
    } catch (e: any) {
      return reject(e?.data?.message);
    }
  };
  return new Promise(executePoll);
};

export const readNotif = async (data: { id: string; readMessage: string }) => {
  const options = {
    method: 'PUT',
    skipErrorHandler: true,
    data,
  };
  const res = await request('withdrawal/read', options);
  return res;
};

export const readMessage = async (data: { id: string; readMessage: string }) => {
  const options = {
    method: 'PUT',
    skipErrorHandler: true,
    data,
  };
  const res = await request('messageRecipient/read', options);
  return res;
};
