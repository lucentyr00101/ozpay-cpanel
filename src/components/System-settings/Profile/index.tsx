import React, { useEffect } from 'react';
import { useState } from 'react';
import { Form, Input, Button, Divider, message, Row, Space } from 'antd';
import './index.less';
import { Content } from 'antd/lib/layout/layout';
import { CopyTwoTone } from '@ant-design/icons';
import Typography from 'antd/lib/typography';
import ResetPassword from '@/components/System-settings/ResetPassword';
import ResetOTP from '@/components/Merchant/ResetOTP';
import { Access, getLocale, useAccess, useIntl } from 'umi';
import styles from './index.less';
import { useModel } from 'umi';
// import { getMerchant } from '@/pages/merchant/list/service';
import { getUser, resetOTP, resetPassword } from '@/pages/system-settings/users/service';
import { updateMerchant } from '@/pages/system-settings/profile/service';
import { getMerchant } from '@/pages/merchant/list/service';
import { maxLength } from '@/global';
import { fetchMemberPlatformLinkByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import RegisterOtp from '@/components/Common/RegisterOtp';
import { verifyCodeWithToken } from '@/services/ant-design-pro/api';

const { Text } = Typography;

const ProfileContent: React.FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const [form] = Form.useForm();

  const [memberPlatformLink, setMemberPlatformLink] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [resetOTPModal, setResetOTP] = useState(false);
  const [resetPasswordModal, setResetPassword] = useState(false);
  const [resetOtpType, setResetOtpType] = useState('');
  const [scanQrModal, setScanQrModal] = useState(false);
  const [profile, setProfile] = useState({
    id: '',
    username: 'DummyAcc',
    userType: '',
    merchant_domain: 'https://opayant-member.mir708090.com/',
    merchant_url: 'testingdummyUrl',
    customer_service_url: null,
    accepted_time_limit: null,
    payment_time_limit: null,
    merchant_id: '',
    depositRate: 0,
    customerServiceUrl: '',
    merchantNo: '',
  });

  const { initialState, refresh } = useModel('@@initialState');
  const { currentUser } = (initialState || {}) as any;
  const [merchantUser, setMerchantUser] = useState({
    acceptTimeLimit: 0,
    paymentTimeLimit: 0,
    platformName: '',
  } as any);

  const fetchDictionaryMemberPlatformLink = async () => {
    const memberPlatformLinkValue = await fetchMemberPlatformLinkByDictionaryCode(
      DICTIONARY_TYPE_CODE.Member_Platform_Link_Code,
      selectedLang,
    );
    setMemberPlatformLink(memberPlatformLinkValue);
  };

  const showResetPassword = (value: boolean) => {
    setResetPassword(value);
  };

  const showResetOTP = (value: boolean) => {
    setResetOTP(value);
  };

  const getMerchantDetail = async () => {
    // const { _data } = await getMerchant(currentUser.id);
    const merchantId = currentUser.merchant ? currentUser.merchant.id : '';
    const { data } = await getUser(currentUser.username);
    if (currentUser.userType === 'Merchant') {
      const { data: _merchant } = await getMerchant(merchantId);
      // console.log({ _merchant });
      const filteredMerchant = {
        ..._merchant,
        depositRate: _merchant.depositRate.toFixed(2),
        merchantDepositRate: _merchant.merchantDepositRate.toFixed(2),
      };
      setMerchantUser(filteredMerchant);
      form.setFieldsValue(filteredMerchant);
    } else if (currentUser.userType === 'Member') {
      const merchant = (data.merchants && data.merchants[0]) || {};
      setMerchantUser(merchant);
      form.setFieldsValue(merchant);
    }

    setProfile({
      ...profile,
      ...data,
      username: currentUser.username,
      merchant_id: merchantId,
      ...merchantUser,
    });

    // console.log({ platform: profile });
  };
  const handleUpdateUser = async (values: any) => {
    try {
      await updateMerchant({
        ...profile,
        ...merchantUser,
        acceptTimeLimit: values.acceptTimeLimit,
        paymentTimeLimit: values.paymentTimeLimit,
        customerServiceUrl: values.customerServiceUrl,
        platformName: values.platformName,
        // level: 'VIP',
        sysUser: {
          ...profile,
        },
      } as any);
      message.success(t.formatMessage({ id: 'messages.updateProfile' }));
    } catch (error) {
      message.error(error.data.message);
    }
  };

  const handleResetOTP = async (values: any) => {
    try {
      const data = await resetOTP({
        username: currentUser.username,
        code: values.code,
        qrImageType: values.qrImageType,
      });
      if (data.success) {
        message.success(t.formatMessage({ id: 'messages.resetOtp' }));
        setOtpError('');
        setResetOTP(false);
        refresh();
      }
    } catch (error: any) {
      if (error.data.code == 10110011) {
        setOtpError(t.formatMessage({ id: 'pages.login.incorrectOtp' }));
      } else {
        setOtpError(error.data.message);
      }
    }
  };

  const handleResetPassword = async (values: any) => {
    try {
      const data = await resetPassword({
        username: currentUser.username,
        password: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (data.success) {
        setResetPassword(false);
        message.success(t.formatMessage({ id: 'messages.resetPw' }));
      }
    } catch (error: any) {
      if (error.data.code == 1011002) {
        message.error(t.formatMessage({ id: 'pages.login.incorrectPassword' }));
        return;
      }
      message.error(error.data.message);
    }
  };

  const verifyOtp = async (code: any) => {
    try {
      const { success } = await verifyCodeWithToken({
        username: currentUser?.username as string,
        qrImageType: 'Transaction',
        code,
      });
      if (success) {
        refresh();
        message.success(t.formatMessage({ id: 'messages.saved' }));
      }
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    getMerchantDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDictionaryMemberPlatformLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    if (!resetOTPModal) {
      setOtpError('');
    }
  }, [resetOTPModal]);

  useEffect(() => {
    const currMenuAccess = access?.SystemSettings.Profile;
    const settingProfile = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(settingProfile.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Content className={styles.profileContainer}>
      <div>
        <div className="font-semibold">{t.formatMessage({ id: 'modal.profileSetting' })}</div>
        <Access accessible={pageAccess}>
          <div className="profile">
            <div className="profileItem">
              <div className="title">{t.formatMessage({ id: 'modal.id' })}</div>
              <div className="data">{profile.id || profile.merchant_id}</div>
              <div
                className="copy"
                onClick={() => {
                  navigator.clipboard.writeText(profile.id || profile.merchant_id);
                  message.success(t.formatMessage({ id: 'modal.idCopied' }));
                }}
              >
                <CopyTwoTone />
              </div>
            </div>
            <div className="profileItem">
              <div className="title">{t.formatMessage({ id: 'modal.username' })}</div>
              <div className="data">{profile.username}</div>
              <div
                className="copy"
                onClick={() => {
                  navigator.clipboard.writeText(profile.username);
                  message.success(t.formatMessage({ id: 'modal.usernameCopied' }));
                }}
              >
                <CopyTwoTone />
              </div>
            </div>
            {}
            {profile.userType === 'Merchant' && (
              <div>
                <Form form={form} onFinish={(values: any) => handleUpdateUser(values)}>
                  <Form.Item
                    name="depositRate"
                    className="formTitle formSmall"
                    label={t.formatMessage({ id: 'modal.deposit' })}
                  >
                    <Input disabled />
                  </Form.Item>
                  <Space align="baseline">
                    <Form.Item
                      className="formTitle formSmall"
                      label={t.formatMessage({ id: 'modal.platformLink' })}
                    >
                      <div style={{ display: 'flex', width: '100%' }}>
                        <div className="domainContainer">
                          <Text className="memberlinkTextBox" disabled>
                            {memberPlatformLink}
                          </Text>
                        </div>
                        <div className="urlContainer">
                          <Text className="memberlinkTextBox" disabled>
                            {merchantUser?.merchantNo}
                          </Text>
                        </div>
                      </div>
                      <div />
                    </Form.Item>
                    <div
                      className="copy"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${memberPlatformLink}/${merchantUser.merchantNo}`,
                        );
                        message.success(t.formatMessage({ id: 'modal.platformLinkCopied' }));
                      }}
                    >
                      <CopyTwoTone />
                    </div>
                  </Space>
                  <Space align="baseline">
                    <Form.Item
                      name="platformName"
                      className="formTitle formSmall"
                      label={t.formatMessage({ id: 'modal.platform' })}
                    >
                      <Input defaultValue={merchantUser.platformName} style={{ width: '280px' }} />
                    </Form.Item>
                    <div
                      className="copy"
                      onClick={() => {
                        navigator.clipboard.writeText(form.getFieldValue('platformName') || '');
                        message.success(t.formatMessage({ id: 'modal.platformCopied' }));
                      }}
                    >
                      <CopyTwoTone />
                    </div>
                  </Space>
                  <Space align="baseline">
                    <Form.Item
                      name="customerServiceUrl"
                      className="formTitle formSmall"
                      label={t.formatMessage({ id: 'modal.csLink' })}
                    >
                      <Input
                        placeholder="CSR Link"
                        maxLength={maxLength.CSR_LINK}
                        defaultValue={form.getFieldValue('customerServiceUrl')}
                        style={{ width: '280px' }}
                      />
                    </Form.Item>
                    <div
                      className="copy"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          form.getFieldValue('customerServiceUrl') || '',
                        );
                        message.success(t.formatMessage({ id: 'modal.csCopied' }));
                      }}
                    >
                      <CopyTwoTone />
                    </div>
                  </Space>
                  <Row>
                    <Form.Item
                      initialValue={merchantUser.acceptTimeLimit}
                      name="acceptTimeLimit"
                      className="formTitle"
                      label={t.formatMessage({ id: 'modal.acceptedTimeLimit' })}
                    >
                      <Input
                        defaultValue={merchantUser.acceptTimeLimit}
                        style={{ minWidth: '154px' }}
                      />
                      {/* <Select style={{ minWidth: '154px' }}>
                        <Option value={30}>30</Option>
                        <Option value={60}>60</Option>
                      </Select> */}
                    </Form.Item>
                    <Form.Item
                      initialValue={merchantUser.paymentTimeLimit}
                      name="paymentTimeLimit"
                      className="formTitle"
                      label={t.formatMessage({ id: 'modal.paymentTimeLimit' })}
                    >
                      <Input
                        defaultValue={merchantUser.paymentTimeLimit}
                        style={{ minWidth: '154px' }}
                      />
                      {/* <Select style={{ minWidth: '154px' }}>
                        <Option value={30}>30</Option>
                        <Option value={60}>60</Option>
                      </Select> */}
                    </Form.Item>
                  </Row>
                  <Form.Item style={{ float: 'right' }}>
                    <Button className="primary-button" type="primary" htmlType="submit">
                      {t.formatMessage({ id: 'modal.update' })}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>
        </Access>
        <Divider />
        <div>
          <div className="font-semibold">{t.formatMessage({ id: 'modal.securitySetting' })}</div>
          <div className="profile">
            <div style={{ marginBottom: '20px' }}>
              <Access accessible={access?.SystemSettings.Profile.ResetPassword}>
                <Button type="primary" onClick={() => showResetPassword(true)}>
                  {t.formatMessage({ id: 'modal.resetPassword' })}
                </Button>
                <ResetPassword
                  visible={resetPasswordModal}
                  onCancel={() => setResetPassword(false)}
                  onCreate={(values: any) => handleResetPassword(values)}
                />
              </Access>
            </div>
            <div className="">
              <Access accessible={access?.SystemSettings.Profile.ResetOTP}>
                <div>
                  <Button
                    type="primary"
                    onClick={() => {
                      showResetOTP(true);
                      setResetOtpType('Login');
                    }}
                  >
                    {t.formatMessage({ id: 'modal.resetOTP1' })}
                  </Button>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setResetOtpType('Transaction');
                      if (currentUser?.isResetTransactionOtp) {
                        setScanQrModal(true);
                      } else {
                        // setScanQrModal(true)
                        showResetOTP(true);
                      }
                    }}
                  >
                    {currentUser?.isResetTransactionOtp
                      ? t.formatMessage({ id: 'modal.setOTP2' })
                      : t.formatMessage({ id: 'modal.resetOTP2' })}
                  </Button>
                </div>
                <RegisterOtp
                  verify={verifyOtp}
                  type={resetOtpType}
                  visible={scanQrModal}
                  close={() => setScanQrModal(false)}
                />
                <ResetOTP
                  title={
                    resetOtpType === 'Login'
                      ? t.formatMessage({ id: 'modal.resetOTP1' })
                      : t.formatMessage({ id: 'modal.resetOTP2' })
                  }
                  type={resetOtpType}
                  error={otpError}
                  visible={resetOTPModal}
                  onCancel={() => setResetOTP(false)}
                  onCreate={(values: any) => handleResetOTP(values)}
                />
              </Access>
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
};

export default ProfileContent;
