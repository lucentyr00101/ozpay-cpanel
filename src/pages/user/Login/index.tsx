import { LockOutlined, UserOutlined } from '@ant-design/icons';
import QRImg from '@/components/Auth/QRImg';
import { Alert, Avatar, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { ProFormText, LoginForm } from '@ant-design/pro-form';
import {
  useIntl,
  FormattedMessage,
  SelectLang,
  useModel,
  history,
  getLocale,
  setLocale,
} from 'umi';
import { getQRImg, login, verifyCode, getLogo } from '@/services/ant-design-pro/api';
import styles from './index.less';
import './form.less';
import languageIcon from '@/assets/language.svg';
import { removeTokens, setTokens } from '@/global';
import { getUser } from '@/pages/system-settings/users/service';
import moment from 'moment';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }: any) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    banner
    showIcon
  />
);

const Login: React.FC = () => {
  const intl = useIntl();
  const locale = getLocale();
  const { refresh } = useModel('@@initialState');

  const [, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [QRImgData, setQRImg] = useState('');
  const [credential, setCredential] = useState({ username: '', password: '' });
  const [token, setToken] = useState({
    accessToken: '',
    refreshToken: '',
    loginTime: null,
    expiry: null,
  } as any);

  const [logovalue, setLogo] = useState({
    id: '',
    logo: '',
  });

  const image = <img src={languageIcon} alt="" />;

  const postLocalesData = () => [
    {
      lang: 'zh-CN',
      label: '简体中文',
      icon: '🇨🇳',
      title: '语言',
    },
    {
      lang: 'en-US',
      label: 'English',
      icon: '🇺🇸',
      title: 'Language',
    },
  ];

  const getLogoDetail = async () => {
    const { data } = await getLogo();

    setLogo({
      ...logovalue,
      ...data,
    });
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
    return userInfo;
  };

  const fetchQRImg = async (_username: string, _token: string) => {
    const data = {
      username: _username,
      qrImageType: 'Login',
    };
    return getQRImg(data, _token);
  };

  const backToLogin = () => {
    setQRImg('');
    setShowOTP(false);
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const msg = await login(values);
      setCredential(values);
      if (msg.success) {
        setLoginError('');
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        setToken({
          loginTime: moment(),
          expiry: moment().add(1, 'minutes').add(50, 'seconds'),
          accessToken: msg.data?.accessToken,
          refreshToken: msg.data?.refreshToken,
        });
        refresh();
        message.success(defaultLoginSuccessMessage);

        const { data }: any = await getUser(values.username, msg.data?.accessToken);

        if (data.isResetLoginOtp) {
          const { data: qrImg }: any = await fetchQRImg(values.username, msg.data?.accessToken);
          setQRImg(qrImg);
        }

        setShowOTP(true);

        /** 此方法会跳转到 redirect 参数所在的位置 */
        // if (!history) return;
        // const { query } = history.location;
        // const { redirect } = query as { redirect: string };
        // history.push(redirect || '/');
        return;
      } else {
        setToken({ accessToken: '', refreshToken: '', loginTime: null });
        removeTokens();
        refresh();
      }
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch (error) {
      // const defaultLoginFailureMessage = intl.formatMessage({
      //   id: 'pages.login.failure',
      //   defaultMessage: '登录失败，请重试！',
      // });
      removeTokens();
      refresh();

      if (error.data.code === 1011002) {
        const incorrectPasswordFailureMessage = intl.formatMessage({
          id: 'pages.login.incorrectPassword',
          defaultMessage: '密码错误。请输入正确的密码。',
        });
        setLoginError(incorrectPasswordFailureMessage);
        return;
      }

      if (error.data.code === 10110014) {
        const ipAddressNotWhitelistedFailureMessage = intl.formatMessage({
          id: 'pages.login.ipAddressNotWhitelisted',
          defaultMessage: '您无权使用您的IP地址访问本网站。 请联系管理员。',
        });
        setLoginError(ipAddressNotWhitelistedFailureMessage);
        return;
      }

      if (error.data.code === 10110017) {
        const incorrectPasswordFailureMessage = intl.formatMessage({
          id: 'pages.login.incorrectUsername',
          defaultMessage: '用户名不存在。请输入正确的用户名。',
        });
        setLoginError(incorrectPasswordFailureMessage);
        return;
      }

      if (error.data.code === 10110019) {
        const incorrectPasswordFailureMessage = intl.formatMessage({
          id: 'pages.login.accountDisbaled',
          defaultMessage: '您的帐户已被禁用。 请联系管理员。',
        });
        setLoginError(incorrectPasswordFailureMessage);
        return;
      }

      message.error(error.data.message);
    }
  };
  const handleVerify = async (code: string) => {
    setVerifyLoading(true);
    try {
      console.log({ diff: token.expiry.diff(token.loginTime) > 0 });
      if (token.loginTime && token.expiry.diff(token.loginTime) > 0) {
        const msg = await login(credential);
        setToken({
          loginTime: moment(),
          expiry: moment().add(10, 'seconds'),
          accessToken: msg.data?.accessToken,
          refreshToken: msg.data?.refreshToken,
        });
      }
      setHasError(false);
      const data = await verifyCode(
        { username: credential.username, code, qrImageType: 'Login' },
        token.accessToken,
      );
      console.log({ data });
      if (data.success) {
        if (data.code === 200) {
          const dataMessage = intl.formatMessage({
            id: 'pages.login.requestSuccessful',
            defaultMessage: '请求成功。',
          });
          message.success(dataMessage);
        } else {
          message.success(data.message);
        }

        setTokens(token.accessToken, token.refreshToken);

        refresh();

        const response = await fetchUserInfo();

        // await setInitialState(() => ({
        //   currentUser: {
        //     username,
        //     token: cookies.get('auth_token'),
        //   },
        // }));
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        const roles = response?.grantedRoles[0].name;
        let indexKey = '/dashboard';

        switch (roles) {
          case 'Admin':
            indexKey = '/dashboard/member';
            break;
          case 'Merchant':
            indexKey = '/dashboard/merchant';
            break;
          case 'Agent':
            indexKey = '/dashboard/agent';
            break;
          default:
            break;
        }
        setVerifyLoading(false);
        localStorage.setItem('active_key', indexKey);
        history.push(redirect || indexKey);
      }
    } catch (error: any) {
      console.log({ error });
      setVerifyLoading(false);
      if (error.data.code == 1011002) {
        message.error(intl.formatMessage({ id: 'pages.login.incorrectPassword' }));
      } else if (error.data.code == 1012001) {
        message.error(intl.formatMessage({ id: 'pages.login.emptyOtp' }));
      } else if (error.data.code == 10110012) {
        message.error(intl.formatMessage({ id: 'pages.login.invalidToken' }));
      } else if (error.data.message.indexOf('Incorrect OTP') > -1) {
        message.error(intl.formatMessage({ id: 'pages.login.incorrectOtp' }));
      } else if (error.data.code == 10110011) {
        message.error(intl.formatMessage({ id: 'pages.login.ipAddressNotWhitelisted' }));
      } else {
        message.error((error.data && error.data.message) || error);
      }
      setHasError(true);
    }
  };

  useEffect(() => {
    getLogoDetail();
    if (!locale || locale !== 'en-US') {
      setLocale('zh-CN', false);
    } else {
      setLocale('en-US', false);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && (
          <SelectLang
            postLocalesData={postLocalesData}
            icon={image}
            className={styles.langIcon}
            reload={false}
          />
        )}
      </div>
      {showOTP ? (
        <QRImg
          loading={verifyLoading}
          hasError={hasError}
          img={QRImgData}
          verify={async (code: string) => await handleVerify(code)}
          backToLogin={backToLogin}
        />
      ) : (
        <div className={styles.content}>
          <LoginForm
            title={intl.formatMessage({ id: 'pages.login.welcomeTo' })}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values: API.LoginParams) => {
              await handleSubmit(values);
            }}
          >
            {logovalue.logo && <Avatar size={125} shape="square" src={logovalue.logo} />}

            {loginError && <LoginMessage content={loginError} />}
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} style={{ color: '#1890FF' }} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.username.placeholder',
                defaultMessage: '用户名',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="请输入用户名!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} style={{ color: '#1890FF' }} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: '密码',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="请输入密码！"
                    />
                  ),
                },
              ]}
            />
          </LoginForm>
        </div>
      )}
    </div>
  );
};

export default Login;
