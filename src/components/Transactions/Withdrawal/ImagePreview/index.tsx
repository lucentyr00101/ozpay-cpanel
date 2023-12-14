import type { FC } from 'react';
import styles from './index.less';
import { DownloadOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-form';
import { Space, Button, Image, Row } from 'antd';

interface Props {
  visible: boolean;
  image: string | undefined;
  close: () => void;
  status: string | undefined;
  url: string | undefined;
  id: string | undefined;
  closeParent: () => void;
}

const ImagePreview: FC<Props> = ({ visible, close, status, url }) => {
  return (
    <ModalForm
      title={false}
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        onCancel: () => close(),
      }}
      submitter={{
        render: () => {
          return (
            <Space>
              <Button type="ghost" onClick={() => close()}>
                Cancel
              </Button>
            </Space>
          );
        },
      }}
    >
      <p style={{ fontSize: '16px', fontWeight: '500' }}>
        {status === 'Under Review' ? 'Withdrawal Approval' : 'Uploaded Receipt'}
      </p>
      <div className={styles.siteCardBorderLessWrapper}>
        <Image preview={false} width={200} src={url} />
      </div>
      {!!url && (
        <Row style={{ marginTop: '0.5rem' }} justify="center">
          <Button type="primary" icon={<DownloadOutlined />} size={'middle'} onClick={download}>
            Download
          </Button>
        </Row>
      )}
    </ModalForm>
  );
};

export default ImagePreview;
