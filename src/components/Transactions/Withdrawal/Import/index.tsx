import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-form';
import { Button, Col, Row, Tooltip, message, Form, Result } from 'antd';
import { useState } from 'react';
import type { FC } from 'react';
import './index.less';
import { useIntl, useModel } from 'umi';
import {
  fetchCryptoTemplate,
  fetchTemplate,
  importFile,
} from '@/pages/transaction/shared/withdrawal/service';
// import * as XLSX from 'xlsx';
import type { UploadFile } from 'antd/lib/upload/interface';
import ErrorImportModal from '@/components/Common/ErrorImportModal';
import { verifyCodeWithToken } from '@/services/ant-design-pro/api';
import OtpModal from '@/components/Common/OtpModal';

interface Props {
  visible: boolean;
  close: () => void;
  reloadTable: () => void;
}

const ImportWithdrawalModal: FC<Props> = ({ visible, close, reloadTable }) => {
  const t = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState as any;
  const { username, userType } = currentUser;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [excelFileList, setExcelFileList] = useState<UploadFile[]>([]);
  const [successUpload, setSuccessUpload] = useState(false);
  const [importResp, setImportResp] = useState({});
  const [showError, setShowError] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const downloadFromBlob = (blob: Blob, filename: string) => {
    // console.log(blob instanceof Blob);
    const blobData = new Blob([blob], { type: '' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobData);
    link.download = filename;
    link.click();
  };

  const handleDownloadTemplate = async () => {
    const res = await fetchTemplate();
    const filename =
      t.formatMessage({ id: 'modal.withdrawFiatTemplate' }) + `${username}_${userType}.xlsx`;
    downloadFromBlob(res, filename);
  };

  const validFile = (file: File) => {
    const greaterThan10MB = file.size / 1024 / 1024 > 10;
    if (greaterThan10MB) message.error(t.formatMessage({ id: 'messages.excelExceed10MB' }));
    return !greaterThan10MB;
  };

  const handleCryptoDownloadTemplate = async () => {
    const res = await fetchCryptoTemplate();
    const filename =
      t.formatMessage({ id: 'modal.withdrawCryptoTemplate' }) + `${username}_${userType}.xlsx`;
    downloadFromBlob(res, filename);
  };

  const handleImportFile = async (values: any) => {
    setLoading(true);
    try {
      const file = values.file[0].originFileObj;
      if (validFile(file)) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await importFile(formData);
        setImportResp(data);
        setSuccessUpload(true);
        // notification.success({
        //   message: t.formatMessage({ id: 'messages.imported' }),
        //   duration: 2,
        // });
        setTimeout(() => {
          close();
          setSuccessUpload(false);
          setExcelFileList([]);
        }, 3000);
        reloadTable();
      }
    } catch (e: any) {
      if (e.data && e.data.data) {
        setImportResp(e.data.data);
        form.setFieldsValue({ file: null });
        setExcelFileList([]);
      }
      setShowError(true);
    }
    setLoading(false);
  };

  const verifyOtp = async (code: string) => {
    try {
      const { success } = await verifyCodeWithToken({
        username: currentUser?.username as string,
        qrImageType: 'Transaction',
        code,
      });
      if (success) {
        await handleImportFile(form.getFieldsValue());
        setShowOtpModal(false);
      }
    } catch (e: any) {
      message.error(t.formatMessage({ id: 'messages.incorrectOtp' }));
    }
  };

  const handleCloseModal = () => {
    close();
    form.resetFields();
    setExcelFileList([]);
  };

  return (
    <ModalForm
      width={700}
      className="importModal"
      visible={visible}
      submitter={{
        render: ({ submit }) => [
          <Button key="cancel" onClick={handleCloseModal} hidden={successUpload}>
            {t.formatMessage({ id: 'modal.cancel' })}
          </Button>,
          <Form.Item key="confirm" noStyle shouldUpdate>
            {({ getFieldsValue }) => {
              const { file } = getFieldsValue();
              const invalidForm = file && file.length > 0 ? true : false;
              return (
                <Button
                  loading={loading}
                  type="primary"
                  disabled={!invalidForm}
                  onClick={submit}
                  hidden={successUpload}
                >
                  {t.formatMessage({ id: 'modal.confirm' })}
                </Button>
              );
            }}
          </Form.Item>,
          <Button key="close" onClick={close} hidden={!successUpload}>
            {t.formatMessage({ id: 'modal.close' })}
          </Button>,
        ],
      }}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: handleCloseModal,
      }}
      onFinish={async () => setShowOtpModal(true)}
    >
      <h3>{t.formatMessage({ id: 'modal.importTitle' })}</h3>
      {!successUpload && (
        <>
          <ErrorImportModal
            data={importResp}
            visible={showError}
            close={() => setShowError(false)}
          />
          <Row justify="center" align="middle">
            <Col span={20}>
              <ProFormUploadDragger
                name="file"
                accept=".csv,.xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                title={t.formatMessage({ id: 'modal.uploadText' })}
                fieldProps={{
                  maxCount: 1,
                  fileList: excelFileList,
                  onChange: ({ fileList }) => {
                    setExcelFileList(fileList);
                  },
                  beforeUpload: () => false,
                }}
                description={
                  <>
                    <p className="ant-upload-hint">
                      {t.formatMessage({ id: 'modal.uploadHint1' })}
                    </p>
                    <p className="ant-upload-hint">
                      {t.formatMessage({ id: 'modal.uploadHint2' })}
                    </p>
                    <p className="ant-upload-hint">
                      {t.formatMessage({ id: 'modal.uploadHint3' })}
                    </p>
                  </>
                }
              />
            </Col>
          </Row>
          <Row className="templateRow">
            <p className="templateDocument">{t.formatMessage({ id: 'modal.templateDocument' })}</p>
            <Tooltip title={t.formatMessage({ id: 'modal.tooltip' })}>
              <QuestionCircleOutlined style={{ marginLeft: 8, paddingTop: 2 }} />
            </Tooltip>
          </Row>
          <Row>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size={'middle'}
              style={{ margin: '0 auto' }}
              onClick={handleDownloadTemplate}
            >
              {t.formatMessage({ id: 'modal.download' })}
            </Button>
          </Row>
          <Row>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size={'middle'}
              style={{ margin: '1.5rem auto' }}
              onClick={handleCryptoDownloadTemplate}
            >
              {t.formatMessage({ id: 'modal.cryptoDownload' })}
            </Button>
          </Row>
        </>
      )}
      {successUpload && (
        <Result
          status="success"
          title={t.formatMessage({ id: 'modal.importSuccessful' })}
          subTitle={t.formatMessage({ id: 'modal.importSuccessfulSub' })}
          // extra={extra}
          style={{ marginBottom: 16 }}
        >
          {
            <Row justify="center" align="middle">
              {t.formatMessage({ id: 'modal.total' })} : {importResp.totalRowCount}
              <br />
              {t.formatMessage({ id: 'modal.totalImportSuccessful' })} :{' '}
              {importResp.totalSuccessCount}
              <br />
              {t.formatMessage({ id: 'modal.totalImportFaied' })}: {importResp.totalFailedCount}
            </Row>
          }
        </Result>
      )}
      <OtpModal visible={showOtpModal} close={() => setShowOtpModal(false)} verify={verifyOtp} />
    </ModalForm>
  );
};

export default ImportWithdrawalModal;
