import { Space } from 'antd';
import React from 'react';
import { useModel } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import SelectLang from '../SelectLang';
import Notification from './Notification';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <Notification />
      <Avatar />
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
