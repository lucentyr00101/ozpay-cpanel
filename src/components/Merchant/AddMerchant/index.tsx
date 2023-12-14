import React, { useEffect, useState } from 'react';

import { getLocale, useIntl } from 'umi';

import { Form, Input, Row, Col, Select, Button } from 'antd';
import { ModalForm, ProFormDigit, ProFormSelect } from '@ant-design/pro-form';

import styles from './index.less';

import closeIcon from '@/assets/close-circle.svg';
import { maxLength, Validator } from '@/global';
import {
  fetchMerchantLevelByDictionaryCode,
  fetchMerchantMemberStatusByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import { fetchAgents } from '@/services/ant-design-pro/agent';

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

  const [agents, setAgents] = useState([] as any);
  const [savingForm, setSavingForm] = useState(false);
  const [minAgentDepositRate, setMinAgentDepositRate] = useState();
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

  const fetchAgentList = async () => {
    const { data } = await fetchAgents({
      size: 1000,
      page: 0,
    });
    setAgents(data);
    return data.map((agent: any) => {
      return {
        label: agent.sysUser.username,
        value: agent.sysUser.username,
      };
    });
  };

  const handleAgentListInfo = (currValue) => {
    const agentList = agents.filter((val) => {
      return val.sysUser.username === currValue;
    });

    if (agentList && agentList.length > 0) {
      setMinAgentDepositRate(agentList[0].agentDepositRate);
    }
    form.setFieldsValue({
      platformName: agentList && agentList[0].platformName,
      merchantDepositRate:
        agentList && agentList[0].merchantDepositRate > 0 && agentList[0].merchantDepositRate,
      depositRate: agentList && agentList[0].depositRate > 0 && agentList[0].depositRate,
    });
  };

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
            {({ getFieldsValue }) => {
              const fields = getFieldsValue();
              console.log(fields);
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
            label={t.formatMessage({ id: 'modal.merchantName' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
          >
            <Input maxLength={maxLength.NAME} />
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
            label={t.formatMessage({ id: 'modal.merchantStatus' })}
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
            label={t.formatMessage({ id: 'modal.level' })}
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
            label={t.formatMessage({ id: 'modal.merchant_pwsd' })}
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
              minLength={maxLength.PASSWORD_MIN_LENGTH}
              maxLength={maxLength.PASSWORD}
            />
          </Form.Item>
        </Col>
        <Col span={11}>
          <Form.Item
            name="platformName"
            label={t.formatMessage({ id: 'modal.platform' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
          >
            <Input maxLength={maxLength.NAME} />
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
          <ProFormSelect
            name="agentUsername"
            label={t.formatMessage({ id: 'table.agent' })}
            request={fetchAgentList}
            fieldProps={{
              onChange: handleAgentListInfo,
            }}
          />
          <ProFormDigit
            name="merchantDepositRate"
            label={t.formatMessage({ id: 'modal.merchantDepositRate' })}
            placeholder="%"
            min={1}
            fieldProps={{
              max: maxLength.RATE_MAX_VALUE,
              min: minAgentDepositRate,
              precision: 2,
              addonAfter: '%',
            }}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
          />
          <ProFormDigit
            name="depositRate"
            label={t.formatMessage({ id: 'modal.memberDepositRate' })}
            placeholder="%"
            min={1}
            fieldProps={{
              max: maxLength.RATE_MAX_VALUE,
              min: minAgentDepositRate,
              precision: 2,
              addonAfter: '%',
            }}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default AddNewMerchant;
