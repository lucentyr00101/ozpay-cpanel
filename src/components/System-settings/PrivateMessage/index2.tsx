import React, { useEffect, useState } from 'react';
import './index.less';
import { ModalForm, ProFormRadio, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Form } from 'antd';
import { useIntl } from 'umi';
import { getRoleAll } from '@/pages/system-settings/roles/service';
import { getUserList } from '@/pages/system-settings/users/service';

export interface Values {
  title: string;
  description: string;
  modifier: string;
}

interface CollectionCreateFormProps {
  editForm: boolean;
  title: string;
  form: any;
  visible: boolean;
  values: any;
  editModalValue: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const Privatemessage: React.FC<CollectionCreateFormProps> = ({
  editForm,
  title,
  visible,
  form,
  onCreate,
  onCancel,
  editModalValue,
}) => {
  const t = useIntl();
  const [savingForm, setSavingForm] = useState(false);
  const [type, setType] = useState('' as any);
  const [roles, setRoles] = useState({});

  const [user, setUser] = useState({});
  const recipientData = editModalValue.messageRecipients;
  let role;
  const rolearray = [];
  let useredit;
  const userarray = [];
  if (editModalValue.messageRecipients) {
    if (editModalValue.recipientType == 'Selected Roles') {
      for (let i = 0; i < recipientData.length; i++) {
        role = recipientData[i].entityId + '|' + recipientData[i].name;
        rolearray.push(role);
      }
    } else if (editModalValue.recipientType == 'Selected Users') {
      for (let i = 0; i < recipientData.length; i++) {
        useredit = recipientData[i].name;
        userarray.push(useredit);
      }
    }
  }

  const fetchRoles = async () => {
    const { data } = await getRoleAll();
    setRoles(
      data.reduce((prev, curr: any) => {
        prev[curr.id + '|' + curr.name] = curr.name;

        return prev;
      }, {}),
    );
  };

  const fetchUser = async () => {
    const { data } = await getUserList();
    setUser(
      data.reduce((prev: any, curr: any) => {
        if (!curr) {
          return prev;
        }
        prev[curr.id + '|' + curr.username] = curr.username;
        return prev;
      }, {}),
    );
  };

  useEffect(() => {
    fetchRoles();
    fetchUser();
  }, []);

  return (
    <ModalForm
      className="Privatemessage"
      modalProps={{
        onCancel: () => onCancel(),
      }}
      width={550}
      title={title}
      visible={visible}
      form={form}
      submitter={{
        render: ({ submit }) => [
          <Form.Item key="confirm" noStyle shouldUpdate>
            {() => {
              // const fields = getFieldsValue();
              // console.log(fields);
              //const invalidForm = Object.keys(fields).some((formKey) => !fields[formKey]);
              return (
                <Button loading={savingForm} type="primary" onClick={submit}>
                  {t.formatMessage({ id: 'modal.confirm' })}
                </Button>
              );
            }}
          </Form.Item>,
        ],
      }}
      onFinish={async (formValues: any) => {
        setSavingForm(true);
        await onCreate(formValues);
        setSavingForm(false);
      }}
    >
      {editForm ? (
        <div>
          <ProFormRadio.Group
            name="recipientType"
            initialValue="All"
            label={t.formatMessage({ id: 'table.recipient' })}
            options={[
              {
                label: `${t.formatMessage({ id: 'modal.all' })}`,
                value: 'All',
              },
              {
                label: `${t.formatMessage({ id: 'modal.selectedRoles' })}`,
                value: 'Selected Roles',
              },
              {
                label: `${t.formatMessage({ id: 'modal.selectedUsers' })}`,
                value: 'Selected Users',
              },
            ]}
            rules={[
              {
                required: true,
                message: `${t.formatMessage({ id: 'modal.recipienteerr' })}`,
              },
            ]}
            fieldProps={{
              onChange: setType,
            }}
          />
          {type ? (
            <ProFormSelect
              name={type.target.value == 'Selected Roles' ? 'name' : 'userid'}
              initialValue={type.target.value == 'Selected Roles' ? rolearray : userarray}
              valueEnum={type.target.value == 'Selected Roles' ? roles : user}
              fieldProps={{
                mode: 'multiple',
              }}
            />
          ) : (
            <ProFormSelect
              name={editModalValue.recipientType == 'Selected Roles' ? 'name' : 'userid'}
              initialValue={
                editModalValue.recipientType == 'Selected Roles' ? rolearray : userarray
              }
              valueEnum={editModalValue.recipientType == 'Selected Roles' ? roles : user}
              fieldProps={{
                mode: 'multiple',
              }}
            />
          )}
          <ProFormTextArea
            name="message"
            label={t.formatMessage({ id: 'table.message' })}
            placeholder={t.formatMessage({ id: 'table.message' })}
            rules={[
              {
                required: true,
                message: `${t.formatMessage({ id: 'modal.messageerr' })}`,
              },
            ]}
          />
        </div>
      ) : (
        <div>
          <ProFormRadio.Group
            name="recipientType"
            initialValue="All"
            label={t.formatMessage({ id: 'table.recipient' })}
            options={[
              {
                label: `${t.formatMessage({ id: 'modal.all' })}`,
                value: 'All',
              },
              {
                label: `${t.formatMessage({ id: 'modal.selectedRoles' })}`,
                value: 'Selected Roles',
              },
              {
                label: `${t.formatMessage({ id: 'modal.selectedUsers' })}`,
                value: 'Selected Users',
              },
            ]}
            rules={[
              {
                required: true,
                message: `${t.formatMessage({ id: 'modal.recipienteerr' })}`,
              },
            ]}
            fieldProps={{
              onChange: setType,
            }}
          />

          {type && (
            <ProFormSelect
              name={type.target.value == 'Selected Roles' ? 'name' : 'id'}
              initialValue={type.target.value == 'Selected Roles' ? rolearray : userarray}
              valueEnum={type.target.value == 'Selected Roles' ? roles : user}
              fieldProps={{
                mode: 'multiple',
              }}
            />
          )}

          <ProFormTextArea
            name="message"
            label={t.formatMessage({ id: 'table.message' })}
            placeholder={t.formatMessage({ id: 'table.message' })}
            rules={[
              {
                required: true,
                message: `${t.formatMessage({ id: 'modal.messageerr' })}`,
              },
            ]}
          />
        </div>
      )}
    </ModalForm>
  );
};

export default Privatemessage;
