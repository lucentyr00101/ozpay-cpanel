import { getCryptoPaymentTypes } from '@/pages/transaction/shared/crypto-payment-type/service';
import { CheckOutlined, CloseOutlined, DollarOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-form';
import { Button, Col, Form, message, Modal, Row, Switch, Typography } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useIntl, Access, useAccess, useModel } from 'umi';
import {
  cryptoChargeRequest,
  fiatChargeRequest,
} from '@/pages/transaction/shared/charge-request/service';
import OtpModal from '@/components/Common/OtpModal';
import { verifyCodeWithToken } from '@/services/ant-design-pro/api';
import RegisterOtp from '@/components/Common/RegisterOtp';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
}

const CreateWithdrawalRequest: FC<Props> = ({ visible, close, reloadTable }) => {
  const t = useIntl();
  const { Text } = Typography;
  const [form] = Form.useForm();
  const access: any = useAccess();
  const { initialState, refresh } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [cryptoRadioValue, setCryptoRadioValue] = useState(false);
  const [cryptoPayments, setCryptoPayments] = useState([]);
  const [cryptoPaymentsEnum, setCryptoPaymentsEnum] = useState({});
  const [selectedCrypto, setSelectedCrypto] = useState({});
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [scanQrModal, setScanQrModal] = useState(false);
  // const [qrCode, setQrCode] = useState('');
  // const qrCodeRef = useRef(null);

  const fetchCryptoPayments = async () => {
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const { data } = await getCryptoPaymentTypes('Merchant');
    // console.log({ data });
    setCryptoPayments(data);
    setCryptoPaymentsEnum(
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
        .reduce((prev, curr) => {
          const name = `${curr.name} - ${curr.networkName}`;
          prev[curr.networkName] = name;
          return prev;
        }, {}),
    );
  };

  const handleSelectedCrypto = () => {
    setSelectedCrypto(
      cryptoPayments.find((item) => item.networkName === form.getFieldValue('cryptoPayment')) || {},
    );
  };

  useEffect(() => {
    fetchCryptoPayments();
  }, []);

  const submitCryptoWithdrawalRequest = async () => {
    try {
      const formData = new FormData();
      const file = form.getFieldValue('file');
      const customRemarks = form.getFieldValue('userRemark');
      const userRemarks = form.getFieldValue('withdrawalRemarks') || [];
      const allRemarks = [...userRemarks];
      if (customRemarks) allRemarks.unshift(customRemarks);
      if (file) formData.set('file', file[0].originFileObj);
      formData.set(
        'merchantToMerchantCryptoWithdrawalAddParam',
        new Blob(
          [
            JSON.stringify({
              merchantId: currentUser?.merchant.id,
              transactionGroup: 'Merchant',
              cryptoPayment: `${selectedCrypto.name}-${selectedCrypto.networkName}`,
              cryptoAddress: form.getFieldValue('cryptoAddress'),
              exchangeRate: selectedCrypto.exchangeRate.toFixed(2),
              ...(allRemarks.length && { remark: allRemarks.join(',') }),
              amount: (+form.getFieldValue('cryptoWithdrawalAmount')).toFixed(2),
            }),
          ],
          { type: 'application/json' },
        ),
      );
      await cryptoChargeRequest(formData);
      refresh();
      reloadTable();
      close();
      form.resetFields();
      setWithdrawalAmount(0);
      setCryptoRadioValue(false);
      setSelectedCrypto({});
      message.success(t.formatMessage({ id: 'modal.chargeRequestSuccess' }));
    } catch (e: any) {
      if (e.data.code === 2090010) {
        return message.error(t.formatMessage({ id: 'messages.notWithinWithdrawalLimit' }));
      }
      if (e.data.code === 2012002) {
        return message.error(t.formatMessage({ id: 'messages.amountGreaterThanAccountBalance' }));
      }

      return message.error('Something went wrong.');
    }
  };
  const submitFiatWithdrawalRequest = async () => {
    try {
      const customRemarks = form.getFieldValue('userRemark');
      const userRemarks = form.getFieldValue('withdrawalRemarks') || [];
      const allRemarks = [...userRemarks];
      if (customRemarks) allRemarks.unshift(customRemarks);
      await fiatChargeRequest({
        merchantId: currentUser?.merchant.id,
        bankName: form.getFieldValue('bankName'),
        bankCard: form.getFieldValue('bankCard'),
        accountName: form.getFieldValue('accountName'),
        accountNo: form.getFieldValue('accountNo'),
        amount: form.getFieldValue('withdrawalAmount').toFixed(2),
        paymentTypeTag: 'Fiat',
        ...(allRemarks.length && { remark: allRemarks.join(',') }),
        transactionGroup: 'Merchant',
      });
      refresh();
      reloadTable();
      close();
      form.resetFields();
      setWithdrawalAmount(0);
      setCryptoRadioValue(false);
      setSelectedCrypto({});
      message.success(t.formatMessage({ id: 'modal.chargeRequestSuccess' }));
    } catch (e: any) {
      if (e.data.code === 2090010) {
        return message.error(t.formatMessage({ id: 'messages.notWithinWithdrawalLimit' }));
      }
      if (e.data.code === 2012002) {
        return message.error(t.formatMessage({ id: 'messages.amountGreaterThanAccountBalance' }));
      }

      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      const { success } = await verifyCodeWithToken({
        username: currentUser?.username as string,
        qrImageType: 'Transaction',
        code,
      });
      if (success) {
        setShowOtpModal(false);
        if (cryptoRadioValue) {
          submitCryptoWithdrawalRequest();
        } else {
          submitFiatWithdrawalRequest();
        }
      }
    } catch (e: any) {
      message.error(t.formatMessage({ id: 'messages.incorrectOtp' }));
    }
  };

  const confirmWithdrawalRequest = () => {
    Modal.confirm({
      centered: true,
      title: t.formatMessage({ id: 'modal.confirmWithdrawalRequest' }),
      content: t.formatMessage({ id: 'modal.confirmWithdrawalRequestDesc' }),
      okText: t.formatMessage({ id: 'modal.confirm' }),
      cancelText: t.formatMessage({ id: 'modal.cancel' }),
      onOk: () =>
        currentUser?.isResetTransactionOtp ? setScanQrModal(true) : setShowOtpModal(true),
    });
  };

  // const cryptoAddress = Form.useWatch('cryptoAddress', form);

  const handleFileUpload = (file: File) => {
    // console.log(file)
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
    return false;
  };

  return (
    <ModalForm
      form={form}
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => {
          form.resetFields();
          setCryptoRadioValue(false);
          close();
        },
      }}
      onValuesChange={(data) => {
        // if (data.cryptoAddress) {
        //   setQrCode(data.cryptoAddress);
        // }
        if (data.cryptoWithdrawalAmount) {
          setWithdrawalAmount(data.cryptoWithdrawalAmount);
        }
      }}
      submitter={{
        render: () => [
          <Access key="cancel" accessible={access.MerchantTransaction.ChargeRequest.Cancel}>
            <Button
              key="cancel"
              onClick={() => {
                form.resetFields();
                setCryptoRadioValue(false);
                close();
              }}
            >
              {t.formatMessage({ id: 'modal.cancel' })}
            </Button>
          </Access>,
          <Access key="confirm" accessible={access.MerchantTransaction.ChargeRequest.Confirm}>
            <Form.Item key="confirm" noStyle shouldUpdate>
              {({ getFieldsValue }) => {
                const fields = getFieldsValue();
                // console.log({ fields });

                const invalidForm = Object.keys(fields).some((fieldName) => {
                  const optionalFields = ['withdrawalRemarks', 'file', 'remark', 'userRemark'];
                  if (
                    !optionalFields.includes(fieldName) &&
                    (fields[fieldName] === undefined ||
                      fields[fieldName] === null ||
                      fields[fieldName] === '')
                  ) {
                    return true;
                  }
                  return false;
                });
                // console.log({ invalidForm });
                return (
                  <Button type="primary" onClick={confirmWithdrawalRequest} disabled={invalidForm}>
                    {t.formatMessage({ id: 'modal.confirm' })}
                  </Button>
                );
              }}
            </Form.Item>
          </Access>,
        ],
      }}
    >
      <p style={{ fontSize: '16px', fontWeight: '500' }}>
        {t.formatMessage({ id: 'trxn.createWithdrawalRequest' })}
      </p>
      <Access accessible={access.MerchantTransaction.ChargeRequest.SwitchPayment}>
        <ProFormGroup align="center" style={{ marginBottom: '2rem' }}>
          <Text
            style={{ fontSize: '16px', fontWeight: 500, alignItems: 'center', display: 'flex' }}
          >
            <DollarOutlined style={{ fontSize: '1.5rem', marginRight: 10 }} />{' '}
            <span>{t.formatMessage({ id: 'trxn.cryptoPayment' })}</span>{' '}
          </Text>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={cryptoRadioValue}
            onChange={(checked) => {
              form.resetFields();
              setCryptoRadioValue(checked);
            }}
          />
        </ProFormGroup>
      </Access>
      {!cryptoRadioValue && (
        <>
          <ProFormGroup colProps={{ xs: 24 }}>
            <ProFormText
              name="bankName"
              width="md"
              label={t.formatMessage({ id: 'trxn.bankName' })}
              placeholder={t.formatMessage({ id: 'trxn.bankName' })}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormDigit
              name="withdrawalAmount"
              width="md"
              label={t.formatMessage({ id: 'trxn.withdrawalAmount' })}
              placeholder={t.formatMessage({ id: 'trxn.withdrawalAmount' })}
              rules={[
                {
                  required: true,
                },
              ]}
            />
          </ProFormGroup>
          <ProFormGroup colProps={{ xs: 24 }}>
            <div>
              <ProFormText
                name="bankCard"
                width="md"
                label={t.formatMessage({ id: 'trxn.bankCard' })}
                placeholder={t.formatMessage({ id: 'trxn.bankCard' })}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                name="accountName"
                width="md"
                label={t.formatMessage({ id: 'trxn.accountName' })}
                placeholder={t.formatMessage({ id: 'trxn.accountName' })}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </div>
            <ProFormCheckbox.Group
              name="withdrawalRemarks"
              label={t.formatMessage({ id: 'trxn.withdrawalRemarks' })}
              options={[
                {
                  label: t.formatMessage({ id: 'trxn.withdrawalRemarksDontSplit' }),
                  value: 'withdrawalRemarksDontSplit',
                  style: { display: 'flex', marginBottom: 10 },
                },
                {
                  label: t.formatMessage({ id: 'trxn.withdrawalRemarksElectronicReceipt' }),
                  value: 'withdrawalRemarksElectronicReceipt',
                  style: { display: 'flex', marginBottom: 10 },
                },
                {
                  label: t.formatMessage({ id: 'trxn.withdrawalRemarks2Pens' }),
                  value: 'withdrawalRemarks2Pens',
                  style: { display: 'flex', marginBottom: 10 },
                },
                {
                  label: t.formatMessage({ id: 'trxn.withdrawalRemarks3Pens' }),
                  value: 'withdrawalRemarks3Pens',
                  style: { display: 'flex', marginBottom: 10 },
                },
              ]}
              fieldProps={{
                onChange: (list: CheckboxValueType[]) => {
                  console.log(list);
                },
              }}
            />
          </ProFormGroup>
          <ProFormGroup colProps={{ xs: 24 }}>
            <ProFormText
              name="accountNo"
              width="md"
              label={t.formatMessage({ id: 'trxn.accountNo' })}
              placeholder={t.formatMessage({ id: 'trxn.accountNo' })}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormTextArea
              name="userRemark"
              width="md"
              fieldProps={{
                maxLength: 100,
              }}
              label={t.formatMessage({ id: 'modal.remarks' })}
              placeholder={t.formatMessage({ id: 'modal.remarks' })}
            />
          </ProFormGroup>
        </>
      )}

      {cryptoRadioValue && (
        <>
          <Row>
            <Col span={12}>
              <ProFormSelect
                name="cryptoPayment"
                width="md"
                label={t.formatMessage({ id: 'trxn.cryptoPayment' })}
                placeholder={t.formatMessage({ id: 'trxn.cryptoPayment' })}
                fieldProps={{
                  onChange: handleSelectedCrypto,
                  onClick: fetchCryptoPayments,
                }}
                valueEnum={cryptoPaymentsEnum}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                name="cryptoWithdrawalAmount"
                min={1}
                width="md"
                label={t.formatMessage({ id: 'trxn.withdrawalAmount' })}
                placeholder={t.formatMessage({ id: 'trxn.withdrawalAmount' })}
                formItemProps={{
                  help: selectedCrypto.exchangeRate
                    ? `${t.formatMessage({ id: 'trxn.exchangeRate' })}: ${
                        selectedCrypto.exchangeRate
                      }`
                    : void 0,
                }}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </Col>
          </Row>
          <Row align="middle">
            <Col span={12}>
              <ProFormText
                name="cryptoAddress"
                width="md"
                label={t.formatMessage({ id: 'trxn.cryptoAddress' })}
                placeholder={t.formatMessage({ id: 'trxn.cryptoAddress' })}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              {
                <Text style={{ fontSize: '18px', fontWeight: 700 }}>
                  {t.formatMessage({ id: 'trxn.usdtWithdrawalAmount' })}:
                  <span style={{ fontSize: '27px' }}>
                    {' '}
                    {(withdrawalAmount * selectedCrypto.exchangeRate &&
                      (withdrawalAmount * selectedCrypto.exchangeRate).toFixed(2)) ||
                      '0.00'}
                  </span>{' '}
                </Text>
              }
            </Col>
          </Row>

          <ProFormGroup colProps={{ xs: 24, md: 24 }} align="center">
            <Row>
              <Col xs={24} md={12} style={{ width: 500 }}>
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
                {/* {!!cryptoAddress && (
                  <>
                    <p>Crypto Address QR Upload:</p>
                    <QRCode className="qr-code" ref={qrCodeRef} size={120} value={qrCode} />
                  </>
                )} */}
              </Col>
              <Col xs={24} md={12}>
                <ProFormCheckbox.Group
                  name="withdrawalRemarks"
                  label={t.formatMessage({ id: 'trxn.withdrawalRemarks' })}
                  options={[
                    {
                      label: t.formatMessage({ id: 'trxn.withdrawalRemarksDontSplit' }),
                      value: 'withdrawalRemarksDontSplit',
                      style: { display: 'flex', marginBottom: 10 },
                    },
                    {
                      label: t.formatMessage({ id: 'trxn.withdrawalRemarksElectronicReceipt' }),
                      value: 'withdrawalRemarksElectronicReceipt',
                      style: { display: 'flex', marginBottom: 10 },
                    },
                    {
                      label: t.formatMessage({ id: 'trxn.withdrawalRemarks2Pens' }),
                      value: 'withdrawalRemarks2Pens',
                      style: { display: 'flex', marginBottom: 10 },
                    },
                    {
                      label: t.formatMessage({ id: 'trxn.withdrawalRemarks3Pens' }),
                      value: 'withdrawalRemarks3Pens',
                      style: { display: 'flex', marginBottom: 10 },
                    },
                  ]}
                  fieldProps={{
                    onChange: (list: CheckboxValueType[]) => {
                      console.log(list);
                    },
                  }}
                />
              </Col>
            </Row>
          </ProFormGroup>
          <ProFormGroup grid colProps={{ xs: 12, offset: 12 }}>
            <ProFormTextArea
              name="userRemark"
              fieldProps={{
                maxLength: 100,
              }}
              width="md"
              label={t.formatMessage({ id: 'modal.remarks' })}
              placeholder={t.formatMessage({ id: 'modal.remarks' })}
            />
          </ProFormGroup>
        </>
      )}
      <RegisterOtp
        verify={verifyOtp}
        type="Transaction"
        visible={scanQrModal}
        close={() => setScanQrModal(false)}
      />
      <OtpModal visible={showOtpModal} close={() => setShowOtpModal(false)} verify={verifyOtp} />
    </ModalForm>
  );
};

export default CreateWithdrawalRequest;
