import React, { useState } from 'react';
import './index.less';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Form } from 'antd';
import { useIntl } from 'umi';

export interface Values {
  title: string;
  sort: number;
  content: string;
  status: string;
  id: string;
}

interface CollectionCreateFormProps {
  title: string;
  form: any;
  visible: boolean;
  values: any;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const Notice: React.FC<CollectionCreateFormProps> = ({
  title,
  visible,
  form,
  onCreate,
  onCancel,
}) => {
  const t = useIntl();
  const [savingForm, setSavingForm] = useState(false);

  return (
    <ModalForm
      className="Notice"
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
            {({ getFieldsValue }) => {
              const fields = getFieldsValue();
              console.log(fields);
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
        console.log(formValues);
        setSavingForm(true);
        await onCreate(formValues);
        setSavingForm(false);
      }}
    >
      <ProFormText
        width="md"
        name="sort"
        label={t.formatMessage({ id: 'table.sort' })}
        placeholder={t.formatMessage({ id: 'table.sort' })}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'messages.sorterr' }),
          },
          {
            pattern: /^[0-9]+$/,
            message: t.formatMessage({ id: 'messages.sorterrvalue' }),
          },
          {
            validator: (_: any, value: any) => {
              if (+value > 0 && +value < 100) return Promise.resolve();
              return Promise.reject();
            },
            message: useIntl().formatMessage({ id: 'messages.sorterrrange' }),
          },
        ]}
      />
      <ProFormTextArea
        name="content"
        label={t.formatMessage({ id: 'table.content' })}
        placeholder={t.formatMessage({ id: 'table.content' })}
        rules={[
          {
            required: true,
            message: t.formatMessage({ id: 'messages.noticeContenterr' }),
          },
        ]}
      />
    </ModalForm>
  );
};

export default Notice;
