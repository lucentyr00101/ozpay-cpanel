import {
  ModalForm,
  ProFormSelect,
  ProFormGroup,
  ProFormDigit,
  ProFormText,
  ProFormSwitch,
  ProFormUploadButton,
} from '@ant-design/pro-form';
import { Access, useAccess, useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { getAllMerchants } from '@/pages/merchant/list/service';
import { getMemberPaymentTypeList } from '@/pages/transaction/shared/fiat-payment-type/service';
import { addWithdrawal, addCryptoWithdrawal } from '@/pages/transaction/shared/withdrawal/service';
import { maxLength } from '@/global';
import cryptoImg from '@/assets/cryptoImg.svg';
import { getMerchant } from '@/pages/merchant/list/service';
import OtpModal from '@/components/Common/OtpModal';
import { verifyCodeWithToken } from '@/services/ant-design-pro/api';
import { fetchAcceptedOrPaymentTimeLimitByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import RegisterOtp from '@/components/Common/RegisterOtp';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
}

const AddWithdrawal: React.FC<Props> = ({ visible, close, reloadTable }) => {
  const t = useIntl();
  const access: any = useAccess();
  const [form] = Form.useForm();
  const [merchantsItems, setMerchantsItems] = useState([] as any);
  const [merchants, setMerchants] = useState([] as any);
  // const [members, setMembers] = useState([] as any);
  // const [selectedMerchant, setSelectedMerchant] = useState({} as any);
  const [paymentTypes, setPaymentTypes] = useState([] as any);
  const [cryptoPaymentTypes, setCryptoPaymentTypes] = useState([] as any);
  const [cryptoList, setCryptoList] = useState([] as any);
  const [isMerchant, setIsMerchant] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [isCrypto, setCrypto] = useState(false);
  const [rate, setRate] = useState('' as any);
  const [amount, setAmount] = useState('' as any);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [scanQrModal, setScanQrModal] = useState(false);

  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;
  const handleFetchMembers = async (id: any) => {
    const _merchant = merchants.find((merchant: any) => merchant.id === id) as any;
    // const { members: _members } = _merchant;

    // setSelectedMerchant(_merchant);
    form.setFieldsValue({
      acceptedTimeLimit: _merchant.acceptTimeLimit,
      paymentTimeLimit: _merchant.paymentTimeLimit,
    });
    // console.log({ _merchant });
    // console.log({
    //   acceptedTimeLimit: selectedMerchant.acceptedTimeLimit,
    //   paymentTimeLimit: selectedMerchant.paymentTimeLimit,
    // });

    // setMembers(
    //   _members.reduce((prev: any, curr: any) => {
    //     prev[curr.id] = curr.username;

    //     return prev;
    //   }, {}),
    // );
    return Promise.resolve(true);
  };

  const handleFetchRate = async (id: any) => {
    const _crypto = cryptoList.find((crypto: any) => crypto.tag === id) as any;
    setRate(_crypto.exchangeRate);
  };

  const handleFetchMerchants = async () => {
    const { data } = (await getAllMerchants()) as any;
    setMerchants(data);
    setMerchantsItems(
      data.reduce((prev: any, curr: any) => {
        if (!curr.sysUser) {
          return prev;
        }
        prev[curr.id] = curr.sysUser.username;

        return prev;
      }, {}),
    );
  };

  const handleAddWithdrawal = async (values: any) => {
    if (isCrypto) {
      try {
        const file = values.file && values.file[0].originFileObj;
        const newForm = new FormData();
        if (file) {
          newForm.set('file', file as unknown as string);
        }
        newForm.set(
          'cryptoWithdrawalAddParam',
          new Blob(
            [
              JSON.stringify({
                ...values,
                exchangeRate: rate.toFixed(2),
                amount: values.amount.toFixed(2),
                transactionGroup: 'Member',
                ...(isMerchant && { merchantId: currentUser?.merchant?.id }),
              }),
            ],
            { type: 'application/json' },
          ),
        );
        await addCryptoWithdrawal(newForm);
        message.success(t.formatMessage({ id: 'messages.addWithdrawal' }));
        close();
        setCrypto(false);
        reloadTable();
        form.resetFields();
        setAmount('');
        setRate('');
      } catch (error: any) {
        message.error(error.data.message || 'Something went wrong.');
      }
    } else {
      try {
        const data = {
          ...values,
          amount: values.amount.toFixed(2),
          transactionGroup: 'Member',
          ...(isMerchant && { merchantId: currentUser?.merchant?.id }),
        };
        await addWithdrawal(data);
        // showNotification(t.formatMessage({ id: 'messages.saved' }));
        message.success(t.formatMessage({ id: 'messages.addWithdrawal' }));
        close();
        reloadTable();
        form.resetFields();
        // setMembers([]);
      } catch (error: any) {
        message.error(error.data.message || 'Something went wrong.');
      }
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      const { success } = await verifyCodeWithToken({
        username: user?.username as string,
        qrImageType: 'Transaction',
        code,
      });
      if (success) {
        await handleAddWithdrawal(form.getFieldsValue());
        setShowOtpModal(false);
      }
    } catch (e: any) {
      message.error(t.formatMessage({ id: 'messages.incorrectOtp' }));
    }
  };

  const handleFetchPaymentTypes = async () => {
    const { data } = await getMemberPaymentTypeList('fiat');
    setPaymentTypes(
      data
        .filter((val) => {
          return val.status === 'Enable';
        })
        .reduce((prev: any, curr: any) => {
          prev[curr.tag] = curr.name;

          return prev;
        }, {}),
    );
  };

  const handleFetchCryptoPaymentTypes = async () => {
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const { data } = await getMemberPaymentTypeList('crypto');
    setCryptoList(data);
    setCryptoPaymentTypes(
      data
        .filter((val: any) => {
          const today = new Date();
          const curTime = `${today.getHours() >= 10 ? today.getHours() : '0' + today.getHours()}:${
            today.getMinutes() >= 10 ? today.getMinutes() : '0' + today.getMinutes()
          }:${today.getSeconds() >= 10 ? today.getSeconds() : '0' + today.getSeconds()}`;
          const operatingHours = val.operatingHours && val.operatingHours.split('-');
          const day = weekday[today.getDay()];

          return (
            val.status === 'Enable' &&
            operatingHours[0] <= curTime &&
            curTime <= operatingHours[1] &&
            val.repeatDays.includes(day)
          );
        })
        .reduce((prev: any, curr: any) => {
          const name = `${curr.name} - ${curr.networkName}`;
          prev[curr.tag] = name;
          return prev;
        }, {}),
    );
  };

  // const showNotification = (notifMessage: string) => {
  //   notification.success({
  //     message: notifMessage,
  //     duration: 2,
  //   });
  // };

  const handleFileUpload = (file: File) => {
    // console.log(file)
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
    return false;
  };

  // const isValidFile = (file: File) => {
  //   const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
  //   if (isGreaterThan2MB) {
  //     message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
  //     return false;
  //   }
  //   return true;
  // };

  const setTimeLimits = async () => {
    const merchantId = user.merchant && user.merchant.id;
    if (merchantId && currentUser?.userType === 'Merchant') {
      try {
        const { data } = await getMerchant(merchantId);
        form.setFieldsValue({
          acceptedTimeLimit: data.acceptTimeLimit,
          paymentTimeLimit: data.paymentTimeLimit,
        });
      } catch (e: any) {
        message.error(e?.data?.message || 'Something went wrong');
      }
    } else {
      const acceptedTimeLimit = await fetchAcceptedOrPaymentTimeLimitByDictionaryCode(
        DICTIONARY_TYPE_CODE.Accepted_Time_Limit_Code,
      );
      const paymentTimeLimit = await fetchAcceptedOrPaymentTimeLimitByDictionaryCode(
        DICTIONARY_TYPE_CODE.Payment_Time_Limit_Code,
      );

      try {
        form.setFieldsValue({
          acceptedTimeLimit: acceptedTimeLimit,
          paymentTimeLimit: paymentTimeLimit,
        });
      } catch (e: any) {
        message.error(e?.data?.message || 'Something went wrong');
      }
    }
  };

  useEffect(() => {
    handleFetchMerchants();
    handleFetchPaymentTypes();
    handleFetchCryptoPaymentTypes();
    setCurrentUser(user);
    setIsMerchant(currentUser.userType === 'Merchant');
    console.log({ currentUserasdads: currentUser });
  }, [setIsMerchant, currentUser, user]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    } else {
      setTimeLimits();
    }
  }, [visible, form]);

  return (
    <ModalForm
      width={750}
      title={false}
      visible={visible}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
          resetText: t.formatMessage({ id: 'modal.cancel' }),
        },
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setCrypto(false);
          setAmount('');
          setRate('');
          close();
        },
      }}
      form={form}
      onFinish={async () =>
        user?.isResetTransactionOtp ? setScanQrModal(true) : setShowOtpModal(true)
      }
    >
      <p style={{ fontSize: '16px', fontWeight: '500' }}>
        {t.formatMessage({ id: 'modal.addWithdrawal' })}
      </p>
      {/* <ProFormGroup> */}
      <Access accessible={access?.MemberTransaction?.Withdrawal.SwitchPayment}>
        <div
          style={{
            display: 'flex',
            width: '200px',
            alignItems: 'baseline',
            justifyContent: 'space-around',
          }}
        >
          <div>
            <img width="25px" src={cryptoImg} />
          </div>
          <div>{t.formatMessage({ id: 'trxn.cryptoPayment' })}</div>
          <ProFormSwitch
            colProps={{
              span: 4,
            }}
            fieldProps={{
              onChange: setCrypto,
            }}
            width="md"
            name="cypto"
          />
        </div>
      </Access>
      <RegisterOtp
        verify={verifyOtp}
        type="Transaction"
        visible={scanQrModal}
        close={() => setScanQrModal(false)}
      />
      <OtpModal visible={showOtpModal} close={() => setShowOtpModal(false)} verify={verifyOtp} />
      {/* </ProFormGroup> */}
      {isCrypto ? (
        <div>
          <ProFormGroup>
            {isMerchant ? (
              <ProFormText
                width="md"
                name="merchantId"
                label={t.formatMessage({ id: 'modal.merchant' })}
                fieldProps={{
                  style: {
                    minWidth: 140,
                  },
                }}
                disabled
                initialValue={currentUser.username}
                onChange={handleFetchMembers}
                placeholder={t.formatMessage({ id: 'modal.merchantdesc' })}
                rules={[{ required: true, message: t.formatMessage({ id: 'modal.merchanterr' }) }]}
              />
            ) : (
              <ProFormSelect
                width="md"
                name="merchantId"
                label={t.formatMessage({ id: 'modal.merchant' })}
                valueEnum={merchantsItems}
                showSearch
                fieldProps={{
                  style: {
                    minWidth: 140,
                  },
                }}
                onChange={handleFetchMembers}
                placeholder={t.formatMessage({ id: 'modal.merchantdesc' })}
                rules={[{ required: true, message: t.formatMessage({ id: 'modal.merchanterr' }) }]}
              />
            )}
            <ProFormSelect
              width="md"
              name="cryptoPayment"
              label={t.formatMessage({ id: 'trxn.cryptoPayment' })}
              // label={t.formatMessage({ id: 'modal.paymentType' })}
              valueEnum={cryptoPaymentTypes}
              onChange={handleFetchRate}
              placeholder={t.formatMessage({ id: 'modal.paymentTypedesc' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.paymentTypeerr' }) }]}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormText
              width="md"
              name="memberUsername"
              label={t.formatMessage({ id: 'modal.memberUsername' })}
              placeholder={t.formatMessage({ id: 'modal.memberUsernamedesc' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.memberUsernameerr' }) },
              ]}
              fieldProps={{
                maxLength: maxLength.NAME,
              }}
            />
            <ProFormText
              width="md"
              name="cryptoAddress"
              // label={t.formatMessage({ id: 'modal.bankName' })}
              label={t.formatMessage({ id: 'trxn.cryptoAddress' })}
              placeholder={t.formatMessage({ id: 'modal.cryptoAddressDesc' })}
              rules={[
                {
                  required: true,
                  message: t.formatMessage({ id: 'modal.cryptoAddressErr' }),
                },
              ]}
              fieldProps={{
                maxLength: maxLength.NAME,
              }}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              initialValue="60"
              width="md"
              name="acceptedTimeLimit"
              label={t.formatMessage({ id: 'modal.acceptedTimeLimit' })}
              min={1}
              placeholder={t.formatMessage({ id: 'modal.acceptedTimeLimitdesc' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.acceptedTimeLimiterr' }) },
              ]}
            />
            <div>
              <div>{t.formatMessage({ id: 'trxn.qrCode' })}</div>
              <div>
                <ProFormUploadButton
                  accept=".jpg,.jpeg,.png"
                  name="file"
                  max={1}
                  fieldProps={{
                    name: 'file',
                    listType: 'picture-card',
                    beforeUpload: handleFileUpload,
                  }}
                  title={t.formatMessage({ id: 'modal.upload' })}
                  // extra="The logo will be display on both front-end and back-end."
                  // fileList={logoFile}
                  // icon={<PlusOutlined />}
                />
              </div>
            </div>
            {/* <ProFormText
              width="md"
              name="accountName"
              // label={t.formatMessage({ id: 'modal.accountName' })}
              label="Crypto Address QR"

              placeholder={t.formatMessage({ id: 'modal.accountNamedesc' })}
              rules={[
                {
                  required: true,
                  message: t.formatMessage({ id: 'modal.accountNameerr' }),
                },
              ]}
              fieldProps={{
                maxLength: maxLength.NAME,
              }}
            /> */}
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              initialValue="60"
              width="md"
              name="paymentTimeLimit"
              label={t.formatMessage({ id: 'modal.paymentTimeLimit' })}
              min={1}
              placeholder={t.formatMessage({ id: 'modal.paymentTimeLimitdesc' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.paymentTimeLimiterr' }) },
              ]}
            />
            <ProFormDigit
              width="md"
              name="amount"
              // label={t.formatMessage({ id: 'modal.amount' })}
              label={t.formatMessage({ id: 'trxn.withdrawalAmount' })}
              extra={`${t.formatMessage({ id: 'trxn.exchangeRate' })} ${rate}`}
              fieldProps={{
                onChange: setAmount,
              }}
              min={1.0}
              placeholder="0.00"
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.amounterr' }) }]}
              // fieldProps={{}}
            />
          </ProFormGroup>
          {/* <ProFormGroup> */}
          <div style={{ display: 'flex', width: '710px' }}>
            <div style={{ width: '50%' }} />
            <div style={{ fontWeight: 'bold' }}>
              {t.formatMessage({ id: 'trxn.usdtWithdrawalAmount' })}: {rate * amount}
            </div>
          </div>

          {/* </ProFormGroup> */}
        </div>
      ) : (
        <div>
          <ProFormGroup>
            {isMerchant ? (
              <ProFormText
                width="md"
                name="merchantId"
                label={t.formatMessage({ id: 'modal.merchant' })}
                fieldProps={{
                  style: {
                    minWidth: 140,
                  },
                }}
                disabled
                initialValue={currentUser.username}
                onChange={handleFetchMembers}
                placeholder={t.formatMessage({ id: 'modal.merchantdesc' })}
                rules={[{ required: true, message: t.formatMessage({ id: 'modal.merchanterr' }) }]}
              />
            ) : (
              <ProFormSelect
                width="md"
                name="merchantId"
                label={t.formatMessage({ id: 'modal.merchant' })}
                valueEnum={merchantsItems}
                showSearch
                fieldProps={{
                  style: {
                    minWidth: 140,
                  },
                }}
                onChange={handleFetchMembers}
                placeholder={t.formatMessage({ id: 'modal.merchantdesc' })}
                rules={[{ required: true, message: t.formatMessage({ id: 'modal.merchanterr' }) }]}
              />
            )}
            <ProFormText
              width="md"
              name="memberUsername"
              label={t.formatMessage({ id: 'modal.memberUsername' })}
              placeholder={t.formatMessage({ id: 'modal.memberUsernamedesc' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.memberUsernameerr' }) },
              ]}
              fieldProps={{
                maxLength: maxLength.NAME,
              }}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              width="md"
              name="amount"
              label={t.formatMessage({ id: 'modal.amount' })}
              min={1.0}
              placeholder="0.00"
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.amounterr' }) }]}
              fieldProps={{}}
            />
            <ProFormSelect
              width="md"
              name="paymentTypeTag"
              label={t.formatMessage({ id: 'modal.paymentType' })}
              valueEnum={paymentTypes}
              placeholder={t.formatMessage({ id: 'modal.paymentTypedesc' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.paymentTypeerr' }) }]}
            />
          </ProFormGroup>
          <ProFormGroup>
            <div style={{ width: '328px' }} />
            <ProFormText
              width="md"
              name="bankName"
              label={t.formatMessage({ id: 'modal.bankName' })}
              placeholder={t.formatMessage({ id: 'modal.bankNamedesc' })}
              rules={[
                {
                  required: true,
                  message: t.formatMessage({ id: 'modal.bankNameerr' }),
                },
              ]}
              fieldProps={{
                maxLength: maxLength.NAME,
              }}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              initialValue="60"
              width="md"
              name="acceptedTimeLimit"
              label={t.formatMessage({ id: 'modal.acceptedTimeLimit' })}
              min={1}
              placeholder={t.formatMessage({ id: 'modal.acceptedTimeLimitdesc' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.acceptedTimeLimiterr' }) },
              ]}
            />
            <ProFormText
              width="md"
              name="accountName"
              label={t.formatMessage({ id: 'modal.accountName' })}
              placeholder={t.formatMessage({ id: 'modal.accountNamedesc' })}
              rules={[
                {
                  required: true,
                  message: t.formatMessage({ id: 'modal.accountNameerr' }),
                },
              ]}
              fieldProps={{
                maxLength: maxLength.NAME,
              }}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              initialValue="60"
              width="md"
              name="paymentTimeLimit"
              label={t.formatMessage({ id: 'modal.paymentTimeLimit' })}
              min={1}
              placeholder={t.formatMessage({ id: 'modal.paymentTimeLimitdesc' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.paymentTimeLimiterr' }) },
              ]}
            />
            <ProFormText
              width="md"
              name="accountNo"
              label={t.formatMessage({ id: 'modal.accountNumber' })}
              placeholder={t.formatMessage({ id: 'modal.accountNumberdesc' })}
              rules={[
                {
                  pattern: new RegExp(/^[0-9]+$/),
                  required: true,
                  message: t.formatMessage({ id: 'modal.accountNumbererr' }),
                },
              ]}
              fieldProps={{
                maxLength: maxLength.VALUE,
              }}
            />
          </ProFormGroup>
        </div>
      )}
    </ModalForm>
  );
};

export default AddWithdrawal;
