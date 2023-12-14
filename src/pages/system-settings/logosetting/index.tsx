import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';

import { useIntl, useAccess, Access } from 'umi';

import { Avatar, message, Popconfirm, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormUploadButton } from '@ant-design/pro-form';
import { DeleteOutlined } from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';

import NotificationMsgBox from '../../../components/NotificationMsgBox/NotificationMsgBox';
import { getLogo, updateLogo } from './service';

import './index.less';

const LogoSetting: FC = () => {
  const t = useIntl();
  const access: any = useAccess();
  // const { initialState } = useModel('@@initialState');
  // const { currentUser } = (initialState || {}) as any;

  const [pageAccess, setPageAccess] = useState<boolean>(false);

  const [logovalue, setLogo] = useState({
    id: '',
    logo: '',
  });

  const getLogoDetail = async () => {
    // const { _data } = await getMerchant(currentUser.id);
    // const merchantId = currentUser.merchant ? currentUser.merchant.id : '';
    const { data } = await getLogo();

    setLogo({
      ...logovalue,
      ...data,
    });
  };

  const handleFileUpload = (file: File) => {
    // console.log(file)
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
    return false;
  };

  const isValidFile = (file: File) => {
    const isGreaterThan2MB = file.size / 1024 / 1024 > 2;
    if (isGreaterThan2MB) {
      message.error(t.formatMessage({ id: 'messages.fileExceed2MB' }));
      return false;
    }
    return true;
  };

  const handleUpdateLogo = async (values: any) => {
    // console.log({ values })
    try {
      // const file = values.file[0]
      const file = values.file[0].originFileObj;

      if (isValidFile(file)) {
        const newForm = new FormData();
        newForm.set('file', file as unknown as string);
        newForm.set(
          'sysFileInfoUpdateParam',
          new Blob(
            [
              JSON.stringify({
                // id: currentUser.id,
                logo: values.file[0].name,
              }),
            ],
            { type: 'application/json' },
          ),
        );
        const data = await updateLogo(newForm);
        if (data.success) {
          setLogo({
            ...logovalue,
            ...data?.data,
          });
        }
        close();
      }
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const newForm = new FormData();
      console.log(logovalue.id);
      newForm.set('file', null as unknown as string);
      newForm.set(
        'sysFileInfoUpdateParam',
        new Blob(
          [
            JSON.stringify({
              // id: currentUser.id,
              logo: null,
            }),
          ],
          { type: 'application/json' },
        ),
      );
      const { success } = await updateLogo(newForm);
      if (success) {
        setLogo({
          id: '',
          logo: '',
        });
      }
      close();
      message.success(t.formatMessage({ id: 'messages.deleted' }));
    } catch (e: any) {
      message.error(e?.data?.message || 'Something went wrong.');
    }
  };

  const formRef = useRef<
    ProFormInstance<{
      file: File;
    }>
  >();

  useEffect(() => {
    getLogoDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currMenuAccess = access?.SystemSettings.LogoSetting;
    const withdrawal = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(withdrawal.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Access
      accessible={pageAccess}
      fallback={
        <Result
          status="404"
          style={{
            height: '100%',
            background: '#fff',
          }}
          title={t.formatMessage({ id: 'messages.sorry' })}
          subTitle={t.formatMessage({ id: 'messages.notAuthorizedAccess' })}
        />
      }
    >
      <PageContainer title={false}>
        <NotificationMsgBox />
        <Content className="containerLogo">
          <ProForm
            formRef={formRef}
            onFinish={handleUpdateLogo}
            submitter={{
              searchConfig: {
                resetText: (
                  <Access accessible={access?.SystemSettings.LogoSetting.Remove}>
                    {!logovalue.logo ? null : (
                      <Popconfirm
                        title={t.formatMessage({ id: 'messages.deleteLogo' })}
                        onConfirm={handleDeleteLogo}
                        okText="Yes"
                        cancelText="No"
                      >
                        <div>
                          <DeleteOutlined />
                          {t.formatMessage({ id: 'modal.remove' })}
                        </div>
                      </Popconfirm>
                    )}
                  </Access>
                ),
                submitText: (
                  <Access accessible={access?.SystemSettings.LogoSetting.Confirm}>
                    {t.formatMessage({ id: 'modal.confirm' })}
                  </Access>
                ),
              },
              resetButtonProps: {},
            }}
          >
            <div className="uploadLogo">
              {!logovalue.logo ? (
                <Access accessible={access?.SystemSettings.LogoSetting.Upload}>
                  <ProFormUploadButton
                    title={t.formatMessage({ id: 'modal.uploadTitle' })}
                    accept=".jpg,.jpeg,.png"
                    name="file"
                    max={1}
                    fieldProps={{
                      name: 'file',
                      listType: 'picture-card',
                      beforeUpload: handleFileUpload,
                    }}
                    extra={t.formatMessage({ id: 'messages.logoDisplayMsg' })}
                    rules={[{ required: true, message: '' }]}
                    // fileList={logoFile}
                    // icon={<PlusOutlined />}
                  />
                </Access>
              ) : (
                <div>
                  <Avatar
                    size={300}
                    shape="square"
                    src={logovalue.logo}
                    style={{ marginBottom: '1rem' }}
                    className="logo-preview"
                  />
                  <Access accessible={access?.SystemSettings.LogoSetting.Upload}>
                    <ProFormUploadButton
                      title={t.formatMessage({ id: 'modal.uploadTitle' })}
                      accept=".jpg,.jpeg,.png"
                      name="file"
                      max={1}
                      fieldProps={{
                        name: 'file',
                        // listType: 'text',
                        beforeUpload: handleFileUpload,
                      }}
                      extra={t.formatMessage({ id: 'messages.logoDisplayMsg' })}
                      rules={[{ required: true, message: '' }]}
                      // fileList={logoFile}
                      // icon={<PlusOutlined />}
                    />
                  </Access>
                </div>
              )}
            </div>
          </ProForm>
        </Content>
      </PageContainer>
    </Access>
  );
};

export default LogoSetting;
