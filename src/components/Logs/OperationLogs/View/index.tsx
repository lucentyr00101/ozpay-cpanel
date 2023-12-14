import { useIntl } from 'umi';
import type { FC } from 'react';
import type { OperationLogItem } from '@/pages/log-management/operation-log/data';
import { Modal } from 'antd';
import ProForm, { ProFormGroup, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import moment from 'moment';
import './index.less';

type RulesMessage = 'className' | 'userAgent' | 'parameters' | 'result';

interface Props {
  visible: boolean;
  close: () => void;
  currentRow: OperationLogItem | undefined;
}

const ViewOpLogs: FC<Props> = ({ visible, close, currentRow }) => {
  const t = useIntl();

  const handleSubmit = async (value: object) => {
    console.log(value);
    return Promise.resolve(close());
  };

  const rulesMessage = (type: RulesMessage) => {
    const dictionary = {
      className: t.formatMessage({ id: 'modal.classNameerr' }),
      userAgent: t.formatMessage({ id: 'modal.userAgenterr' }),
      parameters: t.formatMessage({ id: 'modal.parameterserr' }),
      result: t.formatMessage({ id: 'modal.resulterr' }),
    };
    return dictionary[type];
  };

  return (
    <Modal
      width={1000}
      title={t.formatMessage({ id: 'modal.viewtitle' })}
      visible={visible}
      footer={null}
      destroyOnClose={true}
      onCancel={close}
      className="logView"
    >
      {currentRow?.module && (
        <>
          <ProForm
            submitter={false}
            request={async () => currentRow}
            onFinish={async (value) => await handleSubmit(value)}
          >
            <ProFormGroup>
              <ProFormText
                width="lg"
                name="module"
                label={t.formatMessage({ id: 'modal.moduleName' })}
                disabled
              />
              <ProFormText
                width="lg"
                name="opType"
                label={t.formatMessage({ id: 'modal.operationType' })}
                disabled
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormText
                width="lg"
                name="url"
                label={t.formatMessage({ id: 'modal.url' })}
                disabled
              />
              <ProFormTextArea
                width="lg"
                name="className"
                label={t.formatMessage({ id: 'modal.className' })}
                rules={[{ required: true, message: rulesMessage('className') }]}
                disabled
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormText
                width="lg"
                name="methodName"
                label={t.formatMessage({ id: 'modal.methodName' })}
                disabled
              />
              <ProFormText
                width="lg"
                name="success"
                label={t.formatMessage({ id: 'modal.success' })}
                disabled
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormTextArea
                width="lg"
                name="ua"
                label={t.formatMessage({ id: 'modal.userAgent' })}
                rules={[{ required: true, message: rulesMessage('userAgent') }]}
                disabled
              />
              <ProFormText
                width="lg"
                name="requestMethod"
                label={t.formatMessage({ id: 'modal.requestMethod' })}
                disabled
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormTextArea
                width="lg"
                name="param"
                label={t.formatMessage({ id: 'modal.parameters' })}
                rules={[{ required: true, message: rulesMessage('parameters') }]}
                disabled
              />
              <ProFormTextArea
                width="lg"
                name="result"
                label={t.formatMessage({ id: 'modal.result' })}
                rules={[{ required: true, message: rulesMessage('result') }]}
                disabled
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormText
                width="lg"
                name="createdBy"
                label={t.formatMessage({ id: 'modal.createdBy' })}
                disabled
              />
              <ProFormText
                width="lg"
                name="createdAt"
                label={t.formatMessage({ id: 'modal.createdAt' })}
                fieldProps={{ value: moment(currentRow.createdTime).format('YYYY-MM-DD') }}
                disabled
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormText
                width="lg"
                name="createdIp"
                label={t.formatMessage({ id: 'modal.ipAddress' })}
                disabled
              />
            </ProFormGroup>
            {/* <Row justify="end">
              <Col>
                <Button style={{ marginRight: '10px' }} onClick={() => close()}>
                  {t.formatMessage({ id: 'modal.cancel' })}
                </Button>
                <Button type="primary" htmlType="submit">
                  {t.formatMessage({ id: 'modal.update' })}
                </Button>
              </Col>
            </Row> */}
          </ProForm>
        </>
      )}
    </Modal>
  );
};

export default ViewOpLogs;
