import { ModalForm, ProFormRadio, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { Form, Spin, message } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'umi';

import { getRoleAll } from '@/pages/system-settings/roles/service';
import { getUserList } from '@/pages/system-settings/users/service';
import { addMsg, upadteMsg } from '@/pages/system-settings/privatemessage/service';

interface Props {
  visible: boolean;
  close: () => void;
  title: string;
  reloadTable: () => void;
  currentRow: any;
}

type RecipientType = 'All Users' | 'Selected Roles' | 'Selected Users';

const ComposeMessage: FC<Props> = ({ visible, close, title, reloadTable, currentRow }) => {
  const t = useIntl();

  const [form] = Form.useForm();

  const recipientType: RecipientType = Form.useWatch('recipientType', form);

  const [roles, setRoles] = useState<any>({});
  const [users, setUsers] = useState<any>({});
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const recipientOptions = [
    { label: t.formatMessage({ id: 'modal.allUsers' }), value: 'All Users' },
    { label: t.formatMessage({ id: 'modal.selectedRoles' }), value: 'Selected Roles' },
    { label: t.formatMessage({ id: 'modal.selectedUsers' }), value: 'Selected Users' },
  ];

  const fetchRoles = async () => {
    const { data } = await getRoleAll();
    const _data = data.reduce((acc, role) => {
      acc[`${role.id}|${role.name}`] = role.name;
      return acc;
    }, {});
    setRoles(_data);
  };

  const fetchUsers = async () => {
    setDropdownLoading(true);
    const { data } = await getUserList();
    const _data = data.reduce((acc, user) => {
      acc[`${user.id}|${user.username}`] = user.username;
      return acc;
    }, {});
    setUsers(_data);
    setDropdownLoading(false);
  };

  const recipientEnums = {
    'Selected Roles': roles,
    'Selected Users': users,
  };

  const generateRoleRecipients = (_roles: any) => {
    return _roles.map((recipient: any) => {
      const [id, name] = recipient.split('|');
      const _data = {
        name,
        type: recipientType,
        entityId: id,
      };
      return _data;
    });
  };

  const handleAdd = async (values: any) => {
    try {
      const payload = {
        messageRecipients: (values.recipients && generateRoleRecipients(values.recipients)) || [],
        message: values.message,
        recipientType,
      };
      await addMsg(payload as any);
      message.success(t.formatMessage({ id: 'messages.addMessage' }));
      close();
      reloadTable();
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const handleUpdate = async (values: any) => {
    try {
      const payload = {
        messageRecipients: (values.recipients && generateRoleRecipients(values.recipients)) || [],
        message: values.message,
        recipientType: values.recipientType,
        status: currentRow?.status,
        id: currentRow?.id,
      };
      await upadteMsg(payload as any);
      message.success(t.formatMessage({ id: 'messages.updateMessage' }));
      close();
      reloadTable();
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!currentRow) await handleAdd(values);
    else await handleUpdate(values);
  };

  const setValues = () => {
    if (currentRow) {
      const { message: msgContent, recipientType: _recipientType, messageRecipients } = currentRow;
      const _data = {
        recipientType: _recipientType,
        message: msgContent,
        recipients: messageRecipients.map((_msgRecipient: any) => {
          const { entityId, name } = _msgRecipient;
          return `${entityId}|${name}`;
        }),
      };
      form.setFieldsValue(_data);
    }
  };

  const clearData = () => {
    form.resetFields();
    setRoles({});
    setUsers({});
  };

  useEffect(() => {
    if (visible) {
      fetchRoles();
      fetchUsers();
      setValues();
    } else {
      clearData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <ModalForm
      form={form}
      title={title}
      visible={visible}
      width={500}
      submitter={{
        searchConfig: {
          resetText: '',
          submitText: t.formatMessage({ id: 'modal.confirm' }),
        },
      }}
      modalProps={{
        onCancel: () => close(),
        destroyOnClose: true,
      }}
      onFinish={handleSubmit}
    >
      <ProFormRadio.Group
        name="recipientType"
        initialValue="All Users"
        label={t.formatMessage({ id: 'table.recipient' })}
        options={recipientOptions}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'modal.recipienteerr' }),
          },
        ]}
        fieldProps={{
          onChange: () => form.resetFields(['recipients']),
        }}
        disabled={dropdownLoading}
      />
      {dropdownLoading && (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )}
      {!dropdownLoading && recipientType !== 'All Users' && (
        <ProFormSelect
          name="recipients"
          valueEnum={recipientEnums[recipientType]}
          fieldProps={{
            mode: 'multiple',
            loading: dropdownLoading,
          }}
          rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
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
    </ModalForm>
  );
};

export default ComposeMessage;
