import React from 'react';
import { Col, Divider, Form, Row } from 'antd';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormRadio,
  ProFormTextArea,
  ProFormTreeSelect,
  ProFormDigit,
} from '@ant-design/pro-form';
import { useIntl } from 'umi';
import { maxLength } from '@/global';
import { getResourceList } from '@/pages/system-settings/resources/service';

export interface ResourceForm {
  id?: string;
  name?: string;
  type?: string;
  router?: string;
  code?: string;
  permission?: string;
  status?: string;
  sort?: number;
  icon?: string;
  remark?: string;
  openWay?: string;
}

interface CollectionCreateFormProps {
  resourceTitle: string;
  visible: boolean;
  onUpdate: (values: ResourceForm) => void;
  onCancel: () => void;
}

interface RecursiveData {
  value: string;
  title: string;
  children?: RecursiveData[];
}

export const recursive = (items: any, locale: string) => {
  return items.reduce((acc: any, item: any) => {
    let children = null;
    const { id } = item;
    const translatedName = JSON.parse(item.name)[locale];
    if (!!item.children) {
      children = recursive(item.children, locale);
    }
    const data: RecursiveData = {
      value: id,
      title: translatedName,
    };
    if (children && children.length) {
      data.children = children;
    }
    acc.push(data);
    return acc;
  }, []);
};

const ResourceModal: React.FC<CollectionCreateFormProps> = ({
  onUpdate,
  resourceTitle,
  visible,
  onCancel,
}) => {
  const t = useIntl();
  const [form] = Form.useForm();
  const currentLang = localStorage.getItem('umi_locale');

  const Router = (
    <ProFormText
      name="router"
      label={t.formatMessage({ id: 'modal.router' })}
      placeholder={t.formatMessage({ id: 'modal.router' })}
      rules={[
        {
          required: true,
          message: t.formatMessage({ id: 'modal.routererr' }),
        },
      ]}
    />
  );

  const Remarks = (
    <ProFormTextArea
      name="remark"
      label={t.formatMessage({ id: 'modal.remarks' })}
      placeholder={t.formatMessage({ id: 'modal.remarks' })}
      fieldProps={{
        showCount: true,
        maxLength: 100,
      }}
    />
  );

  const Addresses = (
    <ProFormText
      name="address"
      label={t.formatMessage({ id: 'modal.address' })}
      placeholder={t.formatMessage({ id: 'modal.address' })}
      rules={[
        {
          required: true,
          message: t.formatMessage({ id: 'modal.addresserr' }),
        },
      ]}
    />
  );

  const fetchTreeList = async () => {
    const filter: any = {
      size: 100,
      page: 0,
    };

    const res = await getResourceList(filter);

    const data = recursive(res.data, currentLang as string);
    return Promise.resolve(data);
  };

  return (
    <ModalForm
      form={form}
      width={1200}
      modalProps={{
        onCancel: () => {
          onCancel();
          form.resetFields();
        },
        destroyOnClose: true,
      }}
      onFinish={(values: any) => {
        onUpdate(values);
        return values;
      }}
      visible={visible}
      title={resourceTitle}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
          resetText: t.formatMessage({ id: 'modal.cancel' }),
        },
      }}
    >
      <Row gutter={[80, 20]}>
        <Col xs={24} md={12}>
          <ProFormText
            name="name"
            label={t.formatMessage({ id: 'modal.Name' })}
            placeholder={t.formatMessage({ id: 'modal.Name' })}
            fieldProps={{
              maxLength: maxLength.NAME,
            }}
            rules={[
              {
                required: true,
                message: t.formatMessage({ id: 'modal.Nameerr' }),
              },
            ]}
          />
        </Col>
        <Col xs={24} md={12}>
          <ProFormText
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
        </Col>
      </Row>
      <Row gutter={[80, 20]}>
        <Col xs={24} md={12}>
          <ProFormText
            name="chineseName"
            label={t.formatMessage({ id: 'modal.chineseName' })}
            placeholder={t.formatMessage({ id: 'modal.chineseName' })}
            rules={[
              {
                required: true,
                message: t.formatMessage({ id: 'modal.chineseNameerr' }),
              },
            ]}
          />
        </Col>
        <Col xs={24} md={12}>
          <ProFormRadio.Group
            name="type"
            label={t.formatMessage({ id: 'modal.resource' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.resourceerr' }) }]}
            initialValue="Directory"
            fieldProps={{
              onChange: () => {
                const resourceType = form.getFieldValue('type');
                if (resourceType === 'Button') {
                  form.setFieldsValue({
                    ...form.getFieldsValue(),
                    openWay: 'Without',
                  });
                }
              },
            }}
            options={[
              { label: t.formatMessage({ id: 'modal.resource1' }), value: 'Directory' },
              { label: t.formatMessage({ id: 'modal.resource2' }), value: 'Menu' },
              { label: t.formatMessage({ id: 'modal.resource3' }), value: 'Button' },
            ]}
          />
        </Col>
      </Row>
      <Row gutter={[80, 20]}>
        <Col xs={24} md={12}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const disabled = ['Directory'].includes(form.getFieldValue('type'));
              return (
                <ProFormTreeSelect
                  disabled={disabled}
                  name="pid"
                  label={t.formatMessage({ id: 'modal.parent' })}
                  placeholder={t.formatMessage({ id: 'modal.parent' })}
                  rules={[
                    {
                      required: true,
                      message: t.formatMessage({ id: 'modal.parenterr' }),
                    },
                  ]}
                  request={fetchTreeList}
                  fieldProps={{
                    showArrow: false,
                    filterTreeNode: true,
                    showSearch: true,
                    dropdownMatchSelectWidth: false,
                    labelInValue: true,
                    autoClearSearchValue: true,
                  }}
                />
              );
            }}
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              return (
                <ProFormRadio.Group
                  disabled={form.getFieldValue('type') === 'Button'}
                  name="openWay"
                  label={t.formatMessage({ id: 'modal.open' })}
                  rules={[{ required: true, message: t.formatMessage({ id: 'modal.opendesc' }) }]}
                  initialValue="Internal"
                  options={[
                    { label: t.formatMessage({ id: 'modal.open1' }), value: 'Internal' },
                    { label: t.formatMessage({ id: 'modal.open2' }), value: 'External' },
                    { label: t.formatMessage({ id: 'modal.open4' }), value: 'Components' },
                    { label: t.formatMessage({ id: 'modal.open3' }), value: 'Without' },
                  ]}
                />
              );
            }}
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Row gutter={[80, 20]}>
        <Col xs={24} md={12}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const openWay = form.getFieldValue('openWay');
              const resourceType = form.getFieldValue('type');
              const showField = ['Internal', 'External'];
              const _showField = ['Menu', 'Directory'];
              return showField.includes(openWay) && _showField.includes(resourceType)
                ? Addresses
                : Remarks;
            }}
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <ProFormDigit
            min={1}
            max={100}
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
        </Col>
      </Row>
      <Row gutter={[80, 20]}>
        <Col xs={24} md={12}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const openWay = form.getFieldValue('openWay');
              const resourceType = form.getFieldValue('type');
              const showField = ['Internal', 'External'];
              const _showField = ['Menu', 'Directory'];
              return showField.includes(openWay) && _showField.includes(resourceType)
                ? Router
                : null;
            }}
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <ProFormSelect
            name="status"
            initialValue="Enable"
            label={t.formatMessage({ id: 'modal.visible' })}
            valueEnum={{
              Enable: t.formatMessage({ id: 'modal.enabled' }),
              Disable: t.formatMessage({ id: 'modal.disabled' }),
            }}
            placeholder={t.formatMessage({ id: 'modal.visibledesc' })}
            rules={[{ required: true, message: t.formatMessage({ id: 'modal.visibleerr' }) }]}
          />
        </Col>
      </Row>
      <Row gutter={[80, 20]}>
        <Col xs={24} md={12}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const openWay = form.getFieldValue('openWay');
              const hideField = ['Internal', 'External'];
              return !hideField.includes(openWay) ? null : Remarks;
            }}
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
};

export default ResourceModal;
