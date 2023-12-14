import React, { useEffect, useState } from 'react';

import { getLocale, useIntl } from 'umi';

import { Form, Input, Row, Col, Select, Button } from 'antd';
import { ModalForm, ProFormDigit } from '@ant-design/pro-form';

import styles from './index.less';

import closeIcon from '@/assets/close-circle.svg';
import { maxLength, Validator } from '@/global';
import {
  fetchMerchantLevelByDictionaryCode,
  fetchMerchantMemberStatusByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';

const { Option } = Select;

export interface Values {
  title: string;
  description: string;
  modifier: string;
}

interface CollectionCreateFormProps {
  title: string;
  form: any;
  visible: boolean;
  values: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const AddNewMerchant: React.FC<CollectionCreateFormProps> = ({
  visible,
  title,
  form,
  onCreate,
  onCancel,
}) => {
  const t = useIntl();
  const selectedLang = getLocale();

  const [savingForm, setSavingForm] = useState(false);
  const [merchantLevelEnums, setMerchantLevelEnums] = useState([]);
  const [statusEnums, setStatusEnums] = useState([]);

  const fetchDictionaryMerchantLevel = async () => {
    const merchantLevelEnumValue = await fetchMerchantLevelByDictionaryCode(
      DICTIONARY_TYPE_CODE.Merchants_Level_Code,
      selectedLang,
    );
    setMerchantLevelEnums(merchantLevelEnumValue);
  };

  const fetchDictionaryStatus = async () => {
    const statusEnumValue = await fetchMerchantMemberStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Merchant_Member_Status_Code,
      selectedLang,
    );
    const filterStatusEnumValue: any = Object.values(statusEnumValue).filter((key: any) => {
      return key.value !== 'All';
    });
    setStatusEnums(filterStatusEnumValue);
  };

  useEffect(() => {
    fetchDictionaryMerchantLevel();
    fetchDictionaryStatus();
  }, [selectedLang]);

  // useEffect(() => {
  //   if (!title.includes('Edit')) {
  //     form.resetFields();
  //   }
  // }, [visible, title, form]);

  const submitterText = !title.includes('Edit')
    ? t.formatMessage({ id: 'modal.confirm' })
    : t.formatMessage({ id: 'modal.update' });
  const withdrawalMaxValue = Form.useWatch('withdrawalMax', form);
  const depositMaxValue = Form.useWatch('depositMax', form);
  const depositRate = Form.useWatch('depositRate', form);
  const merchantDepositRate = Form.useWatch('merchantDepositRate', form);
  const agentDepositRate = Form.useWatch('agentDepositRate', form);

  return (
    <ModalForm
      visible={visible}
      title={title}
      submitter={{
        render: ({ submit }) => [
          <Button key="cancel" onClick={() => onCancel()}>
            {t.formatMessage({ id: 'modal.cancel' })}
          </Button>,
          <Form.Item key="confirm" noStyle shouldUpdate>
            {() => {
              //const invalidForm = Object.keys(fields).some((formKey) => !fields[formKey]);
              return (
                <Button loading={savingForm} type="primary" onClick={submit}>
                  {submitterText}
                </Button>
              );
            }}
          </Form.Item>,
        ],
      }}
      modalProps={{
        destroyOnClose: true,
        closeIcon: <img src={closeIcon} />,
        onCancel: () => onCancel(),
      }}
      form={form}
      width={1000}
      onFinish={async (formValues: any) => {
        setSavingForm(true);
        await onCreate(formValues);
        setSavingForm(false);
      }}
    >
      <Row className={styles.rowForm}>
        <Col span={11}>
          <Form.Item
            name="name"
            label={t.formatMessage({ id: 'modal.agentName' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
          >
            <Input
              placeholder={t.formatMessage({ id: 'modal.agentName' })}
              maxLength={maxLength.NAME}
            />
          </Form.Item>
          <Form.Item
            required
            label={t.formatMessage({ id: 'modal.withdrawalLimit' })}
            rules={[
              { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
              Validator.NUMERIC_ONLY(),
            ]}
          >
            <Row>
              <Col>
                <ProFormDigit
                  name="withdrawalMin"
                  key={withdrawalMaxValue}
                  validateTrigger={['onChange']}
                  rules={[
                    {
                      validator: (_, value: any) => {
                        if (+value < withdrawalMaxValue) {
                          return Promise.resolve();
                        }
                        return Promise.reject();
                      },
                      message: t.formatMessage({ id: 'modal.maxwithdrawalerr' }),
                    },
                  ]}
                  fieldProps={{
                    placeholder: t.formatMessage({ id: 'modal.min' }),
                  }}
                  noStyle
                />
              </Col>
              <span className={styles.mx4}>{t.formatMessage({ id: 'modal.to' })}</span>
              <Col>
                <ProFormDigit
                  name="withdrawalMax"
                  rules={[{ required: true, message: t.formatMessage({ id: 'modal.limiterr' }) }]}
                  fieldProps={{
                    placeholder: t.formatMessage({ id: 'modal.max' }),
                  }}
                  noStyle
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            name="status"
            label={t.formatMessage({ id: 'modal.agentStatus' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            initialValue="Enable"
          >
            <Select>
              {statusEnums.map((val: any) => {
                return (
                  <Option value={val.value} key={val.text}>
                    {val.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="level"
            label={t.formatMessage({ id: 'modal.agentLevel' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
          >
            <Select>
              {merchantLevelEnums.map((val: any) => {
                return (
                  <Option value={val.value} key={val.value}>
                    {val.label}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="password"
            label={t.formatMessage({ id: 'modal.password' })}
            rules={[
              {
                required: !title.includes('Edit'),
                message: t.formatMessage({ id: 'modal.errmsg' }),
              },
              { min: maxLength.PASSWORD_MIN_LENGTH },
              { max: maxLength.PASSWORD },
            ]}
          >
            <Input.Password
              placeholder={t.formatMessage({ id: 'modal.password' })}
              minLength={maxLength.PASSWORD_MIN_LENGTH}
              maxLength={maxLength.PASSWORD}
            />
          </Form.Item>
        </Col>
        <Col span={11}>
          <Form.Item name="platformName" label={t.formatMessage({ id: 'modal.platform' })}>
            <Input
              placeholder={t.formatMessage({ id: 'modal.platform' })}
              maxLength={maxLength.NAME}
            />
          </Form.Item>
          <Form.Item required label={t.formatMessage({ id: 'modal.depositLimit' })}>
            <Row>
              <Col>
                <ProFormDigit
                  name="depositMin"
                  validateTrigger={['onChange']}
                  rules={[
                    {
                      validator: (_, value: any) => {
                        if (depositMaxValue) {
                          if (+value < depositMaxValue) return Promise.resolve();
                          else return Promise.reject();
                        }
                        return Promise.resolve();
                      },
                      message: t.formatMessage({ id: 'modal.maxdepositerr' }),
                    },
                  ]}
                  fieldProps={{
                    placeholder: t.formatMessage({ id: 'modal.min' }),
                  }}
                  noStyle
                />
              </Col>
              <span className={styles.mx4}>{t.formatMessage({ id: 'modal.to' })}</span>
              <Col>
                <ProFormDigit
                  name="depositMax"
                  validateTrigger={['onChange']}
                  rules={[{ required: true, message: t.formatMessage({ id: 'modal.limiterr' }) }]}
                  fieldProps={{
                    placeholder: t.formatMessage({ id: 'modal.max' }),
                  }}
                  noStyle
                />
              </Col>
            </Row>
          </Form.Item>
          <Input.Group>
            <ProFormDigit
              name="agentDepositRate"
              label={t.formatMessage({ id: 'modal.agentDepositRate' })}
              placeholder="%"
              fieldProps={{
                max: maxLength.RATE_MAX_VALUE,
                precision: 2,
                addonAfter: '%',
                onChange: () =>
                  form.validateFields(['depositRate']) &&
                  form.validateFields(['merchantDepositRate']),
              }}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                {
                  validator: (_, value: any) => {
                    if (depositRate || merchantDepositRate) {
                      if (+value < depositRate && +value < merchantDepositRate)
                        return Promise.resolve();
                      else return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </Input.Group>
          <Input.Group>
            <ProFormDigit
              name="merchantDepositRate"
              label={t.formatMessage({ id: 'modal.merchantDepositRate' })}
              placeholder="%"
              fieldProps={{
                max: maxLength.RATE_MAX_VALUE,
                precision: 2,
                addonAfter: '%',
                onChange: () => form.validateFields(['agentDepositRate']),
              }}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                {
                  validator: (_, value: any) => {
                    if (value && agentDepositRate) {
                      if (+value > agentDepositRate) return Promise.resolve();
                      else return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                  message: t.formatMessage({
                    id: 'messages.merchantShouldGreaterThanAgentDepositRate',
                  }),
                },
              ]}
            />
          </Input.Group>
          <Input.Group>
            <ProFormDigit
              name="depositRate"
              label={t.formatMessage({ id: 'modal.memberDepositRate' })}
              placeholder="%"
              fieldProps={{
                max: maxLength.RATE_MAX_VALUE,
                precision: 2,
                addonAfter: '%',
                onChange: () => form.validateFields(['agentDepositRate']),
              }}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                {
                  validator: (_, value: any) => {
                    if (value && agentDepositRate) {
                      if (+value > agentDepositRate) return Promise.resolve();
                      else return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                  message: t.formatMessage({
                    id: 'messages.memberShouldGreaterThanAgentDepositRate',
                  }),
                },
              ]}
            />
          </Input.Group>
        </Col>
      </Row>
    </ModalForm>
  );
};

export default AddNewMerchant;
