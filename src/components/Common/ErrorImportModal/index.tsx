import type { FC } from 'react';
import { Button, Modal } from 'antd';
import styles from './index.less';
import { useIntl } from 'umi';
import ErrorIcon from '@/assets/error-circle-solid.svg';
import PartialIcon from '@/assets/Icon-partially.svg';

interface Props {
  visible: boolean;
  close: () => void;
  data: any;
}

const ImportErrorModal: FC<Props> = ({ visible, close, data }) => {
  const t = useIntl();

  return (
    <Modal
      footer={<Button onClick={close}>{t.formatMessage({ id: 'modal.close' })}</Button>}
      className={styles['import-error-modal']}
      title={t.formatMessage({ id: 'modal.importTitle' })}
      onCancel={() => close()}
      visible={visible}
      destroyOnClose
      centered
    >
      <div className="error-container">
        {data.totalRowCount === data.totalFailedCount && (
          <>
            <img className="error_image" src={ErrorIcon} alt="" />
            <p className="error_text error_text-head">
              {t.formatMessage({ id: 'modal.importFail' })}
            </p>
            <p className="error_text error_text-sub">
              {' '}
              {t.formatMessage({ id: 'modal.importFailMsg' })}
            </p>
          </>
        )}
        {data.totalRowCount !== data.totalFailedCount && (
          <>
            <img className="error_image" src={PartialIcon} alt="" />
            <p className="error_text error_text-head">
              {t.formatMessage({ id: 'modal.partialSuccessful' })}
            </p>
            <p className="error_text error_text-sub">
              {' '}
              {t.formatMessage({ id: 'modal.importpartialMsg' })}
            </p>
          </>
        )}
        <div className="error-summary">
          <p className="error_text">
            {t.formatMessage({ id: 'modal.importFailTotal' })} {data.totalRowCount}
          </p>
          <p className="error_text">
            {t.formatMessage({ id: 'modal.importFailSuccess' })} {data.totalSuccessCount}
          </p>
          <p className="error_text">
            {t.formatMessage({ id: 'modal.importFailFail' })} {data.totalFailedCount}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ImportErrorModal;
