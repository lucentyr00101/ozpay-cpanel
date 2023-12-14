import { Menu } from 'antd';
import { getLocale, setLocale, useModel } from 'umi';
import classNames from 'classnames';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const SelectLang = (props) => {
  const { className } = props;
  const selectedLang = getLocale();
  const { refresh } = useModel('@@initialState');
  
  const changeLang = ({ key }) => {
    setLocale(key, false)
    refresh();
  };
  const locales = ['zh-CN', 'en-US'];
  const languageLabels = {
    'zh-CN': '简体中文',
    'en-US': 'English',
  };
  const languageIcons = {
    'zh-CN': '🇨🇳',
    'en-US': '🇬🇧',
  };
  const langMenu = (
    <Menu className={styles.menu} selectedKeys={[selectedLang]} onClick={changeLang}>
      {locales.map((locale) => (
        <Menu.Item key={locale}>
          <span role="img" aria-label={languageLabels[locale]}>
            {languageIcons[locale]}
          </span>{' '}
          {languageLabels[locale]}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <div
      style={{
        float: 'right',
      }}
    >
      <HeaderDropdown overlay={langMenu} placement="bottomRight">
        <span className={classNames(styles.dropDown, className)}>
          <svg
            viewBox="0 0 24 24"
            focusable="false"
            width="1.2em"
            height="1.2em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "
              className="css-c4d79v"
            />
          </svg>
        </span>
      </HeaderDropdown>
    </div>
  );
};

export default SelectLang;
