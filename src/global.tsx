import { Button, message, notification } from 'antd';
import { useIntl } from 'umi';
import defaultSettings from '../config/defaultSettings';

const { pwa } = defaultSettings;
const isHttps = document.location.protocol === 'https:';
import moment from 'moment';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

export const setTokens = (accessToken: string, refreshToken: string) => {
  const authTokenExp = moment().add(1, 'minutes').add(50, 'seconds').format('YYYY-MM-DD HH:mm:ss');
  const authTokenRefreshExp = moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss');
  cookies.set('auth_token', accessToken, { path: '/', expires: new Date(authTokenExp) });
  cookies.set('auth_token_refresh', refreshToken, {
    path: '/',
    expires: new Date(authTokenRefreshExp),
  });
};

export const removeTokens = () => {
  cookies.remove('auth_token_refresh', { path: '/' });
  cookies.remove('auth_token', { path: '/' });
};

export const refRateCookieMap = {
  'charge-request': 'charge-request',
  'merchant-withdrawal': 'merchant-withdrawal',
  'merchant-deposit': 'merchant-deposit',
  'member-withdrawal': 'member-withdrawal',
  'member-deposit': 'member-deposit',
};

export const filterCookieMap = {
  'merchant-withdrawal': 'filter-merchant-withdrawal',
  'merchant-deposit': 'filter-merchant-deposit',
  'member-withdrawal': 'filter-member-withdrawal',
  'member-deposit': 'filter-member-deposit',
  'member-list': 'filter-member-list',
  'member-account-records': 'filter-member-account-records',
  'merchant-list': 'filter-merchant-list',
  'merchant-account-records': 'filter-merchant-account-records',
  'agent-list': 'filter-agent-list',
  'agent-account-records': 'filter-agent-account-records',
  'member-reports-daily': 'filter-member-reports-daily',
  'member-reports-merchant': 'filter-member-reports-merchant',
  'member-reports-member': 'filter-member-reports-member',
  'merchant-reports-daily': 'filter-merchant-reports-daily',
  'merchant-reports-merchant': 'filter-merchant-reports-merchant',
  'agent-reports-daily': 'filter-agent-reports-daily',
  'agent-reports-agent': 'filter-agent-reports-agent',
  'settings-users': 'filter-settings-users',
  'settings-resources': 'filter-settings-resources',
  'settings-dictionary': 'filter-settings-dictionary',
  'settings-notice': 'filter-settings-notice',
  'settings-message': 'filter-settings-message',
  'logs-operations': 'filter-logs-operations',
  'logs-access': 'filter-logs-access',
};

export const setFilters = (cookieName: string, filterRef: any) => {
  const filters = cookies.get(filterCookieMap[cookieName]);
  if (filters) {
    setTimeout(() => {
      filterRef?.current?.setFieldsValue(filters);
      setTimeout(() => {
        filterRef?.current?.submit();
      }, 800);
    }, 500);
    // console.log(filterRef?.current, filterRef?.current?.getFieldsValue())
  }
};

export const maxLength = {
  NAME: 60,
  TAG: 25,
  AMOUNT: 12, // less decimal and 2 decimal places
  REMARKS: 100,
  PASSWORD: 25,
  PASSWORD_MIN_LENGTH: 8,
  VALUE: 60,
  RATE_MAX_VALUE: 99.99,
  RATE: 5,
  CSR_LINK: 100,
};

export const Validator = {
  NUMERIC_ONLY: () => {
    return {
      pattern: /^[0-9]+$/,
      message: useIntl().formatMessage({ id: 'messages.rules.numeric' }),
    };
  },
  NUMERIC_DECIMAL: () => {
    return {
      pattern: /^\d+(\.\d{1,999})?$/,
      message: useIntl().formatMessage({ id: 'messages.rules.numeric' }),
    };
  },
  MAX_99: () => {
    return {
      validator: (_: any, value: any) => {
        if (+value < 100) {
          return Promise.resolve();
        }

        return Promise.reject();
      },
      message: useIntl().formatMessage({ id: 'messages.max99' }),
    };
  },
  MIN_1: () => {
    return {
      validator: (_: any, value: any) => {
        if (+value > 0) {
          return Promise.resolve();
        }

        return Promise.reject();
      },
      message: useIntl().formatMessage({ id: 'messages.min1' }),
    };
  },

  ALPHABET_ONLY: () => {
    return {
      pattern: /^[a-zA-Z]+$/,
      message: useIntl().formatMessage({ id: 'messages.alphabet' }),
    };
  },
  PASSWORD_NO_SYMBOL: () => {
    return { pattern: /^[a-zA-Z]+$/, message: useIntl().formatMessage({ id: 'messages.symbol' }) };
  },
  PASSWORD_ALPHA_NUM: () => {
    return { pattern: /^\w+$/, message: useIntl().formatMessage({ id: 'messages.symbol' }) };
  },
};

const clearCache = () => {
  // remove all caches
  if (window.caches) {
    caches
      .keys()
      .then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      })
      .catch((e) => console.log(e));
  }
};

// if pwa is true
if (pwa) {
  // Notify user if offline now
  window.addEventListener('sw.offline', () => {
    message.warning(useIntl().formatMessage({ id: 'app.pwa.offline' }));
  });

  // Pop up a prompt on the page asking the user if they want to use the latest version
  window.addEventListener('sw.updated', (event: Event) => {
    const e = event as CustomEvent;
    const reloadSW = async () => {
      // Check if there is sw whose state is waiting in ServiceWorkerRegistration
      // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
      const worker = e.detail && e.detail.waiting;
      if (!worker) {
        return true;
      }
      // Send skip-waiting event to waiting SW with MessageChannel
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (msgEvent) => {
          if (msgEvent.data.error) {
            reject(msgEvent.data.error);
          } else {
            resolve(msgEvent.data);
          }
        };
        worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
      });

      clearCache();
      window.location.reload();
      return true;
    };
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        onClick={() => {
          notification.close(key);
          reloadSW();
        }}
      >
        {useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated.ok' })}
      </Button>
    );
    notification.open({
      message: useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated' }),
      description: useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
      btn,
      key,
      onClose: async () => null,
    });
  });
} else if ('serviceWorker' in navigator && isHttps) {
  // unregister service worker
  const { serviceWorker } = navigator;
  if (serviceWorker.getRegistrations) {
    serviceWorker.getRegistrations().then((sws) => {
      sws.forEach((sw) => {
        sw.unregister();
      });
    });
  }
  serviceWorker.getRegistration().then((sw) => {
    if (sw) sw.unregister();
  });

  clearCache();
}
