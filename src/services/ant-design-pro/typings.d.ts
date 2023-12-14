// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    isResetTransactionOtp: boolean;
    isResetLoginOtp: boolean;
    name?: string;
    username?: string;
    status?: string;
    nickname?: string;
    userType?: string;
    parentMerchantType?: string;
    ipWhitelist?: string;
    id?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
    token?: string;
    grantedRoles?: Array;
  };

  type LoginResult = {
    success?: boolean;
    message?: string;
    data?: { accessToken: string; refreshToken: string };
    code?: number;
  };
  type VerifyCodeResult = {
    success?: boolean;
    message?: string;
    data?: string;
    code?: number;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username: string;
    password: string;
  };

  type QRImgParams = {
    username: string;
    qrImageType: string;
  };
  type verifyCode = {
    username: string;
    code: string;
    qrImageType: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
