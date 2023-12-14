import React, { useEffect, useRef, useState } from 'react';
import { getLocale, useIntl } from 'umi';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormGroup,
  ProFormDependency,
} from '@ant-design/pro-form';

import { maxLength } from '@/global';
import type { UserItem } from '@/pages/system-settings/users/data';
import {
  fetchMerchantMemberStatusByDictionaryCode,
  fetchUserTypeByDictionaryCode,
} from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import { getUserType } from '@/pages/system-settings/users/service';

export interface UserForm {
  id?: string;
  username?: string;
  userType?: string;
  setRole?: string;
  grantedRoles?: string;
  status?: string;
  password?: string;
}

interface CollectionCreateFormProps {
  userTitle: string;
  visible: boolean;
  roles: any;
  user?: UserItem;
  form?: any;
  onCreate: (values: UserForm, isEditing: boolean) => void;
  onCancel: () => void;
}

const UserModal: React.FC<CollectionCreateFormProps> = ({
  userTitle,
  visible,
  roles,
  // user,
  onCancel,
  onCreate,
  form,
}) => {
  const t = useIntl();
  const formRef = useRef();
  const selectedLang = getLocale();
  const isEditing = userTitle.includes(t.formatMessage({ id: 'modal.edit' }));
  const [userTypeEnums, setUserTypeEnums] = useState({});
  const [userData, setUserData] = useState([] as any);
  const [statusEnums, setStatusEnums] = useState({});

  const fetchUserTypeStatus = async () => {
    const userTypeEnumValue = await fetchUserTypeByDictionaryCode(
      DICTIONARY_TYPE_CODE.User_Type_Code,
      selectedLang,
    );
    const filterUserTypeEnumValue = Object.keys(userTypeEnumValue)
      .filter((key) => {
        return key !== 'All';
      })
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: userTypeEnumValue[key],
        });
      }, {});
    setUserTypeEnums(filterUserTypeEnumValue);
  };

  const fetchDictionaryStatus = async () => {
    const statusEnumValue = await fetchMerchantMemberStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Merchant_Member_Status_Code,
      selectedLang,
    );
    const filterUserTypeEnumValue = Object.keys(statusEnumValue)
      .filter((key) => {
        return key !== 'All';
      })
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: statusEnumValue[key],
        });
      }, {});
    setStatusEnums(filterUserTypeEnumValue);
  };

  const fetchUser = async (value: any) => {
    formRef.current?.resetFields(['parentMerchantUsername']);
    const data = {
      parentMerchantType: value,
    };
    const parentUser = await getUserType(data);
    setUserData(
      parentUser.data.reduce((prev: any, curr: any) => {
        if (!curr) {
          return prev;
        }
        prev[curr.username] = curr.username;
        return prev;
      }, {}),
    );
  };

  useEffect(() => {
    fetchUserTypeStatus();
    fetchDictionaryStatus();
  }, [selectedLang]);

  return (
    <ModalForm
      form={form}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onFinish={(values: any) => {
        onCreate(values, isEditing);
        return values;
      }}
      title={userTitle}
      formRef={formRef}
      visible={visible}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
          resetText: t.formatMessage({ id: 'modal.cancel' }),
        },
      }}
    >
      <ProFormGroup>
        <ProFormText
          width="md"
          name="username"
          label={t.formatMessage({ id: 'modal.username' })}
          placeholder={t.formatMessage({ id: 'modal.usernamedesc' })}
          fieldProps={{
            maxLength: maxLength.NAME,
          }}
          rules={[
            {
              required: true,
              validator: (_, value: any) => {
                if (value === '') {
                  return Promise.reject(new Error(t.formatMessage({ id: 'modal.usernameerr' })));
                }

                if (/\s/.test(value)) {
                  return Promise.reject(
                    new Error(t.formatMessage({ id: 'messages.spaceNotAllowed' })),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        />
        <ProFormSelect
          width="md"
          name="status"
          label={t.formatMessage({ id: 'modal.stats' })}
          valueEnum={statusEnums}
          placeholder={t.formatMessage({ id: 'modal.statsdesc' })}
          rules={[{ required: true, message: t.formatMessage({ id: 'modal.statserr' }) }]}
        />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormSelect
          disabled={isEditing}
          width="md"
          name="userType"
          label={t.formatMessage({ id: 'modal.userType' })}
          valueEnum={userTypeEnums}
          placeholder={t.formatMessage({ id: 'modal.userTypedesc' })}
          rules={[{ required: true, message: t.formatMessage({ id: 'modal.userTypeerr' }) }]}
        />
        <ProFormSelect
          width="md"
          name="grantedRoles"
          label={t.formatMessage({ id: 'modal.setRole' })}
          valueEnum={roles}
          fieldProps={{
            mode: 'tags',
          }}
          placeholder={t.formatMessage({ id: 'modal.setRoledesc' })}
          rules={[
            { required: true, message: t.formatMessage({ id: 'modal.setRoleerr' }), type: 'array' },
          ]}
        />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormDependency name={['userType']}>
          {({ userType }) => {
            if (userType === 'Non-Admin') {
              return (
                <ProFormSelect
                  width="md"
                  name="parentMerchantType"
                  label={t.formatMessage({ id: 'modal.parentType' })}
                  valueEnum={{
                    Agent: t.formatMessage({ id: 'table.Agent' }),
                    Merchant: t.formatMessage({ id: 'modal.Merchant' }),
                  }}
                  onChange={fetchUser}
                />
              );
            }
            if (!isEditing) {
              formRef.current.resetFields(['parentMerchantType']);
            }

            return (
              <ProFormSelect
                disabled
                width="md"
                name="parentMerchantType"
                label={t.formatMessage({ id: 'modal.parentType' })}
                valueEnum={{
                  Agent: t.formatMessage({ id: 'table.Agent' }),
                  Merchant: t.formatMessage({ id: 'modal.Merchant' }),
                }}
                onChange={fetchUser}
              />
            );
          }}
        </ProFormDependency>
        <ProFormText.Password
          width="md"
          name="password"
          label={t.formatMessage({ id: 'modal.password' })}
          placeholder={t.formatMessage({ id: 'modal.new_pwsd' })}
          fieldProps={{
            minLength: maxLength.PASSWORD_MIN_LENGTH,
            maxLength: maxLength.PASSWORD,
          }}
          rules={[
            {
              required: true,
              message: t.formatMessage({ id: 'modal.pwsderr' }),
            },
            {
              min: maxLength.PASSWORD_MIN_LENGTH,
              message: `${t.formatMessage({ id: 'modal.password1' })} ${
                maxLength.PASSWORD_MIN_LENGTH
              } ${t.formatMessage({ id: 'modal.character' })}`,
            },
            {
              max: maxLength.PASSWORD,
              message: `${t.formatMessage({ id: 'modal.password2' })}  ${
                maxLength.PASSWORD
              } ${t.formatMessage({ id: 'modal.character' })}`,
            },
          ]}
        />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormDependency name={['userType']}>
          {({ userType }) => {
            if (userType === 'Non-Admin') {
              return (
                <ProFormSelect
                  width="md"
                  name="parentMerchantUsername"
                  label={t.formatMessage({ id: 'modal.parentRelation' })}
                  valueEnum={userData}
                  // placeholder={t.formatMessage({ id: 'modal.parentTypeDesc' })}
                />
              );
            }
            if (!isEditing) {
              formRef.current.resetFields(['parentMerchantUsername']);
            }
            return (
              <ProFormSelect
                disabled
                width="md"
                name="parentMerchantUsername"
                label={t.formatMessage({ id: 'modal.parentRelation' })}
                valueEnum={userData}
                // placeholder={t.formatMessage({ id: 'modal.parentTypeDesc' })}
              />
            );
          }}
        </ProFormDependency>
      </ProFormGroup>
    </ModalForm>
  );
};

export default UserModal;
