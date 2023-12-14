import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Radio, Button, message } from 'antd';
import styles from './index.less';
import { Content } from 'antd/lib/layout/layout';
import TextArea from 'antd/lib/input/TextArea';
import { useIntl, useModel } from 'umi';
import { ProFormDigit, ProFormSelect } from '@ant-design/pro-form';
import { getAllMerchants } from '@/pages/merchant/list/service';
import type { TopUpForm } from '@/pages/merchant/top-up-balance/service';
import { submitTopUp } from '@/pages/merchant/top-up-balance/service';
import { maxLength, Validator } from '@/global';
import { verifyCodeWithToken } from '@/services/ant-design-pro/api';
import OtpModal from '@/components/Common/OtpModal';
import RegisterOtp from '@/components/Common/RegisterOtp';

const TopUp: React.FC = () => {
  const t = useIntl();
  const [form] = Form.useForm();
  const [merchants, setMerchants] = useState([]);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState as any;
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [scanQrModal, setScanQrModal] = useState(false);

  useEffect(() => {
    const get = async () => {
      const { data } = (await getAllMerchants()) as any;
      console.log({ data });
      setMerchants(
        data.reduce((prev: any, curr: any) => {
          if (!curr.sysUser) {
            return prev;
          }
          prev[curr.id] = curr.sysUser.username;

          return prev;
        }, {}),
      );
    };
    get();
  }, []);

  const handleTopUp = async (values: TopUpForm) => {
    try {
      form.validateFields();
      const data = await submitTopUp({
        ...values,
        amount: (+values.amount).toFixed(2),
      });
      if (data.success) {
        form.resetFields();
        message.success(t.formatMessage({ id: 'messages.topUpSuccess' }));
      }
    } catch (error: any) {
      if (error?.data?.code == 2012002) {
        message.error(t.formatMessage({ id: 'messages.deductFail' }));
      } else {
        message.error(error?.data?.message || 'Something went wrong.');
      }
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
        await handleTopUp(form.getFieldsValue());
        setShowOtpModal(false);
      }
    } catch (e: any) {
      message.error(t.formatMessage({ id: 'messages.incorrectOtp' }));
    }
  };

  return (
    <Content className={styles.container}>
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
        onFinish={async () =>
          currentUser?.isResetTransactionOtp ? setScanQrModal(true) : setShowOtpModal(true)
        }
        className={styles.formContainer}
      >
        <Row className={styles.rowForm}>
          <Col span={24}>
            <ProFormSelect
              // width="md"
              name="merchantId"
              fieldKey="id"
              label={t.formatMessage({ id: 'modal.merchantName' })}
              valueEnum={merchants as any}
              rules={[{ required: true, message: t.formatMessage({ id: 'messages.alphabet' }) }]}
            />
            {/* <Form.Item
              name="title"
              label={t.formatMessage({id: 'modal.merchantName'})}
              rules={[{ required: true, message: t.formatMessage({id: 'modal.errmsg'}) }]}
            >
              <Input />
            </Form.Item> */}
            <Form.Item
              name="transactionType"
              label={t.formatMessage({ id: 'modal.transactionType' })}
              rules={[
                {
                  required: true,
                  message: t.formatMessage({ id: 'messages.transactionTypeOption' }),
                },
              ]}
            >
              <Radio.Group>
                <Radio value={'System Addition'}>
                  {t.formatMessage({ id: 'modal.addBalance' })}
                </Radio>
                <Radio value={'System Deduction'}>
                  {t.formatMessage({ id: 'modal.deductBalance' })}
                </Radio>
              </Radio.Group>
            </Form.Item>
            <ProFormDigit
              name="amount"
              label={t.formatMessage({ id: 'modal.amount' })}
              placeholder="0.00"
              fieldProps={{
                maxLength: maxLength.AMOUNT,
              }}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                Validator.NUMERIC_DECIMAL(),
                Validator.MIN_1(),
              ]}
            />

            <Form.Item
              name="remark"
              label={t.formatMessage({ id: 'modal.remarks' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                { max: 100 },
              ]}
            >
              <TextArea
                placeholder={t.formatMessage({ id: 'modal.remarksdesc' })}
                showCount={{ formatter: ({ count }) => `${count}/100` }}
                maxLength={maxLength.REMARKS}
              />
            </Form.Item>
            <Button className={styles.right} htmlType="submit">
              {t.formatMessage({ id: 'modal.confirm' })}
            </Button>
          </Col>
        </Row>
      </Form>
      <RegisterOtp
        verify={verifyOtp}
        type="Transaction"
        visible={scanQrModal}
        close={() => setScanQrModal(false)}
      />
      <OtpModal visible={showOtpModal} close={() => setShowOtpModal(false)} verify={verifyOtp} />
    </Content>
  );
};

export default TopUp;
