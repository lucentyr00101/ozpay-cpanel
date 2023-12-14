/* eslint-disable @typescript-eslint/no-shadow */
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageContainer } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig, RequestConfig } from 'umi';
import { getLocale, getIntl } from 'umi';
import { Link, history } from 'umi';
import RightContent from '@/components/RightContent';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { message } from 'antd';
import styles from './global.less';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
import { refreshToken, getLogo } from '@/services/ant-design-pro/api';
import { removeTokens, setTokens } from './global';
import { resourceTree, getResourceAll } from './pages/system-settings/resources/service';

// import { BookOutlined, LinkOutlined } from '@ant-design/icons';

// const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
// let activeKey = '';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

// const LayoutTitle: React.FC = () => (
//   <div  className={styles.dashboardLogo} />
// );

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  resourceTreeList: [];
  resourceAll: [];
  menuData?: [];
  logoData: {};
}> {
  const authToken = cookies.get('auth_token');
  const authTokenRefresh = cookies.get('auth_token_refresh');
  const selectedLang = getLocale();
  const logoData = await getLogo();
  const fetchUserInfo = async () => {
    if (cookies.get('auth_token')) {
      try {
        const msg = await queryCurrentUser();
        return msg.data;
      } catch (error) {
        removeTokens();
        message.error(error.data.message);
        history.push(loginPath);
      }
    }
    return undefined;
  };

  const sortingMenu = (menu: any) => {
    const sortMenuChild = menu.map((value) => {
      if (value.children) {
        const children = value.children.sort((a, b) => {
          return a.sort - b.sort;
        });
        return { ...value, children };
      }
      return { ...value };
    });

    return sortMenuChild.sort((a, b) => {
      return a.sort - b.sort;
    });
  };

  const menuDataFilterRender = (menuList: any) => {
    return sortingMenu(menuList).map((item) => {
      if (item.type === 'Directory' || item.type === 'Menu') {
        const menuName = JSON.parse(item.name);
        const currentLang = localStorage.getItem('umi_locale') || selectedLang;
        return {
          name: menuName[currentLang],
          localeName: JSON.stringify(menuName),
          path: item.router,
          component: item.component,
          routes: item.children ? menuDataFilterRender(item.children) : undefined,
        };
      }
    });
  };

  if (!authToken && authTokenRefresh) {
    const { data } = await refreshToken(authTokenRefresh);
    setTokens(data.accessToken, data.refreshToken);
  } else if (!authToken && !authTokenRefresh) {
    return {
      fetchUserInfo,
      settings: {},
      resourceTreeList: [],
      resourceAll: [],
      // menuData: [],
      logoData,
    };
  }

  const currentUser = await fetchUserInfo();

  const resourceTreeList = await resourceTree();
  const resourceAll = await getResourceAll();

  const menuDataSorter = menuDataFilterRender(resourceTreeList.data);

  // 如果是登录页面，不执行
  // if (history.location.pathname !== loginPath)

  return {
    logoData,
    fetchUserInfo,
    currentUser,
    settings: {},
    menuData: menuDataSorter,
    resourceTreeList: resourceTreeList.data,
    resourceAll: resourceAll.data,
  };
  // }
  // return {
  //   fetchUserInfo,
  //   settings: {},
  // };
}

// let pages: any[] = [];
// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const menuDataList: string[] = [];
  const selectedLang = getLocale();
  const getResourceAll = initialState?.resourceAll;
  const grantedRoles = initialState?.currentUser?.grantedRoles;
  const roles = initialState?.currentUser?.grantedRoles[0].name;

  const filterResourceOnlyMenu =
    getResourceAll &&
    getResourceAll.filter((data: any) => {
      return data.type === 'Menu' || data.type === 'Directory';
    });

  if (grantedRoles && grantedRoles.length > 0) {
    grantedRoles.map((itemRole) => {
      if (itemRole.sysResources) {
        itemRole.sysResources.forEach((value) => {
          if (value.type === 'Directory' || value.type === 'Menu') {
            menuDataList.push(value.router);
          }
        });
      }
      if (itemRole.sysResourceChecks) {
        itemRole.sysResourceChecks.forEach((value) => {
          if (value.type === 'Directory' || value.type === 'Menu') {
            menuDataList.push(value.router);
          }
        });
      }
    });
  }

  let indexKey = '/dashboard/analysis';
  let tab = 'Analytics';

  switch (roles) {
    case 'Admin':
      indexKey = '/dashboard/member';
      tab = 'menu.dashboard.member';
      break;
    case 'Merchant':
      indexKey = '/dashboard/merchant';
      tab = 'menu.dashboard.merchant';
      break;
    case 'Agent':
      indexKey = '/dashboard/agent';
      tab = 'menu.dashboard.agent';
      break;
    default:
      break;
  }

  // let pages = [
  //   {
  //     key: indexKey,
  //     tab: tab,
  //     path: indexKey,
  //   },
  // ];

  const remove = (targetKey: any) => {
    const intl = getIntl(getLocale());
    let newActiveKey = localStorage.getItem('active_key') || '';
    let lastIndex = 0;
    const pagesMenu = localStorage.getItem('pages_menu');
    const pagesMenuJsonParse = pagesMenu && JSON.parse(pagesMenu);

    if (targetKey === indexKey) {
      message.error(intl.formatMessage({ id: 'messages.homePage' }));
      return;
    }

    pagesMenuJsonParse.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newPanes = pagesMenuJsonParse.filter((pane: any) => pane.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    // pages = newPanes;
    localStorage.setItem('pages_menu', JSON.stringify(newPanes));
    localStorage.setItem('active_key', newActiveKey);
    // activeKey = newActiveKey;
    history.push(newActiveKey);
  };

  const handleTabChange = (key: string) => {
    // activeKey = key;
    localStorage.setItem('active_key', key);
    history.push(key);
  };

  const menuItemClickHandler = (menuItem: any) => {
    const pagesMenu = localStorage.getItem('pages_menu');
    const pagesMenuJsonParse = (pagesMenu && JSON.parse(pagesMenu)) || [];

    const checkPages =
      pagesMenuJsonParse && pagesMenuJsonParse.filter((page) => page.key === menuItem.key);
    // activeKey = menuItem.key;
    localStorage.setItem('active_key', menuItem.key);
    // localStorage.setItem('active_key', JSON.stringify(pagesMenuJsonParse));
    if (checkPages && checkPages.length === 0) {
      pagesMenuJsonParse.push({
        key: menuItem.key,
        tab: menuItem.name,
        path: menuItem.path,
        localeName: menuItem.localeName,
      });
      localStorage.setItem('pages_menu', JSON.stringify(pagesMenuJsonParse));
    }
  };

  const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
    menuList.map((item) => {
      // QX - Permission - Sub Routes (Start)
      if (item.path && !menuDataList.includes(item.path)) {
        return {};
      } else {
        return {
          ...item,
          children: item.children ? menuDataRender(item.children) : undefined,
        };
      }

      // QX - Permission - Sub Routes (End)
    });

  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    // footerRender: () => <Footer />,
    menu: {
      params: { ...initialState },
      request: async () => {
        // initialState.currentUser 中包含了所有用户信息
        // const menuData = await getResourceList({ current: 1, pageSize: 100});
        return initialState?.menuData;
      },
    },
    onPageChange: () => {
      console.log('pagechange')
      const { location } = history;
      // activeKey = location.pathname;
      localStorage.setItem('active_key', location.pathname);
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      } else if (initialState?.currentUser && location.pathname === loginPath) {
        history.push('/dashboard/member');
      }
    },
    // links: isDev
    //   ? [
    //       <Link to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //       <Link to="/~docs">
    //         <BookOutlined />
    //         <span>业务组件文档</span>
    //       </Link>,
    //     ]
    //   : [],
    menuHeaderRender: () => {
      return (
        <div className={styles.dashboardLogo}>
          {initialState?.logoData?.data.logo ? (
            <img
              alt="logo"
              style={{ height: '38px', width: '38px' }}
              className={styles.dashboardLogo}
              src={initialState?.logoData?.data.logo}
            />
          ) : null}
        </div>
      );
    },
    menuDataRender: menuDataRender,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    menuItemRender: (menuItemProps: any, defaultDom: any) => {
      //   const hello = pages.map((value)=>{
      //     // console.log(value);
      //     if(value.key === menuItemProps.key){
      //       return {...value, tab: menuItemProps.name}
      //     }
      //     return {...value};
      //   })
      const pagesMenu = localStorage.getItem('pages_menu');
      const pagesMenuJsonParse = (pagesMenu && JSON.parse(pagesMenu)) || [];

      if (menuItemProps.isUrl) {
        return defaultDom;
      }

      const checkPages =
        pagesMenuJsonParse && pagesMenuJsonParse.filter((page) => page.key === location.pathname);
      if (checkPages && checkPages.length === 0 && menuItemProps.path === location.pathname) {
        // QX - second version need fix
        if (location.pathname !== indexKey) {
          pagesMenuJsonParse.push(
            {
              key: indexKey,
              tab: tab,
              path: indexKey,
              localeName: '{"en-US":"Member","zh-CN":"会员数据看板"}',
            },
            {
              key: menuItemProps.key,
              tab: menuItemProps.name,
              path: menuItemProps.path,
              localeName: `{"en-US":"${menuItemProps.name}","zh-CN":"${menuItemProps.name}"}`,
            },
          );
        } else {
          pagesMenuJsonParse.push({
            key: menuItemProps.key,
            tab: menuItemProps.name,
            path: menuItemProps.path,
            localeName: '{"en-US":"Member","zh-CN":"会员数据看板"}',
          });
        }
        localStorage.setItem('pages_menu', JSON.stringify(pagesMenuJsonParse));
      }

      return (
        <Link
          to={menuItemProps.path}
          target={menuItemProps.target}
          onClick={() => menuItemClickHandler(menuItemProps)}
        >
          {defaultDom}
        </Link>
      );
    },
    childrenRender: (children: any, props: any) => {
      const filteredPages: any[] = [];
      const currentLang = localStorage.getItem('umi_locale') || selectedLang;
      const pagesMenu = localStorage.getItem('pages_menu');
      const activeKey = localStorage.getItem('active_key') || '';
      const pagesMenuJsonParse = pagesMenu && JSON.parse(pagesMenu);

      if (pagesMenuJsonParse && pagesMenuJsonParse.length > 0) {
        pagesMenuJsonParse.map((value: any) => {
          return (
            filterResourceOnlyMenu &&
            filterResourceOnlyMenu.forEach((data: any) => {
              if (data.router.includes(value.path)) {
                filteredPages.push({
                  ...value,
                  localeName: data.name,
                });
              }
            })
          );
        });
      }
      return (
        <>
          {props.location?.pathname?.includes('/login') && <>{children}</>}
          {!props.location?.pathname?.includes('/login') && (
            <>
              <PageContainer
                className={styles.tabLayout}
                title={false}
                breadcrumb={{}}
                tabProps={{
                  type: 'editable-card',
                  hideAdd: true,
                  onEdit: remove,
                }}
                tabList={
                  filteredPages &&
                  filteredPages.map((val) => {
                    if (val.localeName) {
                      const tabName = JSON.parse(val.localeName);
                      return { ...val, tab: tabName[currentLang] };
                    }
                    return { ...val };
                  })
                }
                tabActiveKey={activeKey}
                onTabChange={handleTabChange}
              >
                {children}
              </PageContainer>
              <SettingDrawer
                enableDarkTheme
                settings={initialState?.settings}
                onSettingChange={(settings: any) => {
                  setInitialState((preInitialState: any) => ({
                    ...preInitialState,
                    settings,
                  }));
                }}
              />
            </>
          )}
        </>
      );
    },

    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  prefix: API_URL,
  responseInterceptors: [
    async (response: any) => {
      return response;
    },
  ],
  requestInterceptors: [
    async (url: any, options: any) => {
      const authToken = cookies.get('auth_token');
      const authTokenRefresh = cookies.get('auth_token_refresh');

      if (!authToken && authTokenRefresh && !url.includes('refreshToken')) {
        const { data } = await refreshToken(authTokenRefresh);
        setTokens(data.accessToken, data.refreshToken);
      } else if (!authToken) {
        return {
          url,
          options,
        };
      }
      options.headers.Authorization = `Bearer ${cookies.get('auth_token')}`;
      return {
        url,
        options,
      };
    },
  ],
};
