import React from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import styles from './index.less';
import TextArea from 'antd/lib/input/TextArea';
import { useIntl } from 'umi';
import { maxLength, Validator } from '@/global';
export interface DictionaryTypeForm {
  name: string;
  code: string;
  sort: number;
  status: string;
  remark: string;
}
export interface DictionaryDataForm {
  sysDictTypeId?: string;
  value: string;
  chineseValue: string;
  name: string;
  code: string;
  sort: number;
  status: string;
  remark: string;
}

interface CollectionCreateFormProps {
  isEditingData: boolean;
  dictionaryData: DictionaryDataForm;
  visible: boolean;
  onCreate: (values: DictionaryDataForm, isEditingData: boolean) => void;
  onCancel: () => void;
}

const ValuesForm: React.FC<CollectionCreateFormProps> = ({
  dictionaryData,
  isEditingData,
  visible,
  onCreate,
  onCancel,
}) => {
  const t = useIntl();
  const [form] = Form.useForm();

  if (dictionaryData && Object.keys(dictionaryData).length && isEditingData) {
    form.setFieldsValue(dictionaryData);
  } else {
    form.resetFields();
  }

  const modalTitle = isEditingData
    ? t.formatMessage({ id: 'modal.editValue' })
    : t.formatMessage({ id: 'modal.addvalue' });

  return (
    <Modal
      visible={visible}
      title={modalTitle}
      okText={t.formatMessage({ id: 'modal.confirm' })}
      cancelText={t.formatMessage({ id: 'modal.cancel' })}
      destroyOnClose
      onCancel={onCancel}
      width={500}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            if(!isEditingData){
              form.resetFields();
            }
            onCreate(values, isEditingData);
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
              name="value"
              label={t.formatMessage({ id: 'modal.typeValue' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            >
              <Input maxLength={maxLength.NAME} />
            </Form.Item>

            <Form.Item
              name="chineseValue"
              label={t.formatMessage({ id: 'modal.typeValueChinese' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            >
              <Input maxLength={maxLength.NAME} />
            </Form.Item>

            <Form.Item
              name="code"
              label={t.formatMessage({ id: 'modal.codeStatus' })}
              rules={[{ required: true, message: t.formatMessage({ id: 'modal.errmsg' }) }]}
            >
              <Input maxLength={maxLength.NAME} />
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

export default ValuesForm;
