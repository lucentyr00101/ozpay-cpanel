import React from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import styles from './index.less';
import TextArea from 'antd/lib/input/TextArea';
import { useIntl } from 'umi';
import { maxLength, Validator } from '@/global';
export interface Values {
  value: string;
  id?: string;
  name: string;
  code: string;
  sort: number;
  status: string;
  remark: string;
  chineseValue: string;
  sysDictType: { id: string };
}

interface CollectionCreateFormProps {
  dictionaryType: Values;
  isEditing: boolean;
  visible: boolean;
  onCreate: (values: Values, isEditing: boolean) => void;
  onCancel: () => void;
}

const DictionaryForm: React.FC<CollectionCreateFormProps> = ({
  isEditing,
  dictionaryType,
  visible,
  onCreate,
  onCancel,
}) => {
  const t = useIntl();
  const [form] = Form.useForm();
  const userTitle = isEditing
    ? t.formatMessage({ id: 'modal.edittype' })
    : t.formatMessage({ id: 'modal.addtype' });

  if (dictionaryType && Object.keys(dictionaryType).length && isEditing) {
    form.setFieldsValue(dictionaryType);
  } else {
    form.resetFields();
  }

  return (
    <Modal
      visible={visible}
      title={userTitle}
      okText={t.formatMessage({ id: 'modal.confirm' })}
      cancelText={t.formatMessage({ id: 'modal.cancel' })}
      onCancel={onCancel}
      width={500}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            // form.resetFields();
            onCreate(values, isEditing);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Row className={styles.rowForm}>
          <Col span={24}>
            <Form.Item
              name="name"
              label={t.formatMessage({ id: 'modal.typeName' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            >
              <Input maxLength={maxLength.NAME} />
            </Form.Item>

            <Form.Item
              name="chineseName"
              label={t.formatMessage({ id: 'modal.typeNameChinese' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            >
              <Input maxLength={maxLength.NAME} />
            </Form.Item>

            <Form.Item
              name="code"
              label={t.formatMessage({ id: 'modal.codeStatus' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            >
              <Input maxLength={maxLength.NAME} disabled={isEditing}/>
            </Form.Item>

            <Form.Item
              name="sort"
              label={t.formatMessage({ id: 'modal.sort' })}
              rules={[
                { required: true, message: t.formatMessage({ id: 'modal.errmsg' }) },
                Validator.NUMERIC_ONLY(),
              ]}
            >
              <Input maxLength={4} />
            </Form.Item>
            <Form.Item
              name="remark"
              label={t.formatMessage({ id: 'modal.remarks' })}
              rules={[{ max: 20, message: t.formatMessage({ id: 'modal.remarkserror' }) }]}
            >
              <TextArea rows={4} showCount={{ formatter: ({ count }) => `${count}/20` }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DictionaryForm;
