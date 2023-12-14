import React, { useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormGroup,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-form';
import { getLocale, useIntl } from 'umi';
import { Button, Form } from 'antd';
import type { RoleItem } from '@/pages/system-settings/roles/data';
import { maxLength } from '@/global';
import { fetchMerchantMemberStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';

interface CollectionCreateFormProps {
  roleTitle: string;
  visible: boolean;
  role: RoleItem;
  onCreate: (values: RoleForm, isEditing: boolean) => void;
  onCancel: () => void;
}

export interface RoleForm {
  id?: string;
  name?: string;
  code?: string;
  sort?: number;
  status?: string;
  remark?: string;
  sysResources?: string[];
  sysResourceChecks?: string[];
}

const RoleModal: React.FC<CollectionCreateFormProps> = ({
  role,
  roleTitle,
  visible,
  onCreate,
  onCancel,
}) => {
  const t = useIntl();
  const selectedLang = getLocale();
  const [statusEnums, setStatusEnums] = useState({});

  const [form] = Form.useForm();
  const isEditing = roleTitle.includes(t.formatMessage({ id: 'modal.editRole' }));

  const fetchDictionaryStatus = async () => {
    const statusEnumValue = await fetchMerchantMemberStatusByDictionaryCode(DICTIONARY_TYPE_CODE.Merchant_Member_Status_Code, selectedLang);
    const filterUserTypeEnumValue = 
          Object.keys(statusEnumValue).filter((key) => { return key !== 'All' }).reduce((obj, key) => {
            return Object.assign(obj, {
              [key]: statusEnumValue[key],
            });
          }, {});
    setStatusEnums(filterUserTypeEnumValue);
  }

  if (role && Object.keys(role).length && isEditing) {
    form.setFieldsValue(role);
  } else {
    form.resetFields();
  }

  useEffect(() => {
    fetchDictionaryStatus();
  }, [selectedLang])

  return (
    <ModalForm
      form={form}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        const data = {
          ...values,
          sysResources: role?.sysResources?.map((permission: any) => permission.id),
          sysResourceChecks: role?.sysResourceChecks?.map((permission: any) => permission.id),
        };
        onCreate(data, isEditing);
      }}
      title={roleTitle}
      visible={visible}
      submitter={{
        render: ({ submit }) => [
          <Button key="cancel" onClick={() => onCancel()}>
            {t.formatMessage({ id: 'modal.cancel' })}
          </Button>,
          <Form.Item key="confirm" noStyle shouldUpdate>
            {({ getFieldsValue }) => {
              const fields = getFieldsValue();
              const invalidForm = Object.keys(fields).some((fieldName)=> {
                if(fieldName !== 'remark' && (fields[fieldName] === undefined || fields[fieldName] === null || fields[fieldName] === '')){
                  return true;
                }
                return false;
              })
              return (
                <Button type="primary" onClick={submit} disabled={invalidForm}>
                  {t.formatMessage({ id: 'modal.confirm' })}
                </Button>
              );
            }}
          </Form.Item>,
        ],
      }}
    >
      <ProFormGroup>
        <ProFormText
          width="md"
          name="name"
          fieldProps={{
            maxLength: maxLength.NAME,
          }}
          label={t.formatMessage({ id: 'modal.name' })}
          placeholder={t.formatMessage({ id: 'modal.name' })}
          rules={[
            {
              required: true,
              message: t.formatMessage({ id: 'modal.nameerr' }),
            },
          ]}
        />
        <ProFormText
          width="md"
          name="code"
          label={t.formatMessage({ id: 'modal.code' })}
          placeholder={t.formatMessage({ id: 'modal.code' })}
          rules={[
            {
              required: true,
              message: t.formatMessage({ id: 'modal.codeerr' }),
            },
          ]}
        />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormDigit
          min={1}
          max={100}
          width="md"
          name="sort"
          label={t.formatMessage({ id: 'modal.sort' })}
          placeholder="1-100"
          rules={[
            {
              required: true,
              message: t.formatMessage({ id: 'modal.sorterr' }),
            },
          ]}
        />
        <ProFormSelect
          width="md"
          name="status"
          label={t.formatMessage({ id: 'modal.Status' })}
          valueEnum={statusEnums}
          placeholder={t.formatMessage({ id: 'modal.statusdesc' })}
          rules={[{ required: true, message: t.formatMessage({ id: 'modal.statuserr' }) }]}
        />
      </ProFormGroup>

      <ProFormTextArea
        name="remark"
        label={t.formatMessage({ id: 'modal.remarks' })}
        placeholder={t.formatMessage({ id: 'modal.remarks' })}
        fieldProps={{
          showCount: true,
          maxLength: 100,
        }}
      />
    </ModalForm>
  );
};

export default RoleModal;
