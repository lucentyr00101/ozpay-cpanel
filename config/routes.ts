export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    // component: './dashboard/analysis',
    routes: [
      {
        path: '/dashboard',
        redirect: '/dashboard/member',
      },
      {
        name: 'merchant',
        path: '/dashboard/merchant',
        component: './dashboard/merchant',
      },
      {
        name: 'member',
        path: '/dashboard/member',
        component: './dashboard/member',
      },
      {
        name: 'agent',
        path: '/dashboard/agent',
        component: './dashboard/agent',
      },
    ],
  },
  {
    path: '/merchant-transaction',
    icon: 'TransactionOutlined',
    name: 'MerchantTransaction',
    // access: 'canMemberTransaction',
    routes: [
      {
        path: '/merchant-transaction',
        redirect: '/merchant-transaction/withdrawal',
      },
      {
        name: 'Charge-Request',
        path: '/merchant-transaction/charge-request',
        component: './transaction/merchant/charge-request',
      },
      {
        name: 'Deposit',
        path: '/merchant-transaction/deposit',
        component: './transaction/merchant/deposit',
      },
      {
        name: 'Withdrawal',
        path: '/merchant-transaction/withdrawal',
        component: './transaction/merchant/withdrawal',
      },
      {
        name: 'Crypto-Payment-Type',
        path: '/merchant-transaction/crypto-payment-type',
        component: './transaction/merchant/crypto-payment-type',
      },
    ],
  },
  {
    path: '/member-transaction',
    icon: 'TransactionOutlined',
    name: 'MemberTransaction',
    // access: 'canMemberTransaction',
    routes: [
      {
        path: '/member-transaction',
        redirect: '/member-transaction/withdrawal',
      },
      {
        name: 'Withdrawal',
        path: '/member-transaction/withdrawal',
        component: './transaction/member/withdrawal',
      },
      {
        name: 'Deposit',
        path: '/member-transaction/deposit',
        component: './transaction/member/deposit',
      },
      {
        name: 'Fiat-Payment-Type',
        path: '/member-transaction/fiat-payment-type',
        component: './transaction/member/fiat-payment-type',
      },
      {
        name: 'Crypto-Payment-Type',
        path: '/member-transaction/crypto-payment-type',
        component: './transaction/member/crypto-payment-type',
      },
    ],
  },
  {
    path: '/merchant',
    icon: 'UserOutlined',
    name: 'Merchant',
    // access: 'canMerchant',
    routes: [
      {
        path: '/merchant',
        redirect: '/merchant/list',
      },
      {
        name: 'List',
        path: '/merchant/list',
        component: './merchant/list',
      },
      {
        name: 'Top-Up Balance',
        path: '/merchant/top-up-balance',
        component: './merchant/top-up-balance',
      },
      {
        name: 'Account Transaction Records',
        path: '/merchant/account-transaction-records',
        component: './merchant/account-transaction-records',
      },
    ],
  },
  {
    path: '/members',
    icon: 'TeamOutlined',
    name: 'Member',
    // access: 'canMember',
    routes: [
      {
        path: '/members',
        redirect: '/members/members-list',
      },
      {
        name: 'Members List',
        path: '/members/members-list',
        component: './members/members-list',
      },
      {
        name: 'Account Transaction Records',
        path: '/members/account-transaction-records',
        component: './members/account-transaction-records',
      },
    ],
  },
  {
    path: '/agent',
    icon: 'UserOutlined',
    name: 'Agent',
    routes: [
      {
        path: '/agent',
        redirect: '/agent/list',
      },
      {
        name: 'List',
        path: '/agent/list',
        component: './agent/list',
      },
      {
        name: 'Top-Up Balance',
        path: '/agent/top-up-balance',
        component: './agent/top-up-balance',
      },
      {
        name: 'Account Transaction Records',
        path: '/agent/account-transaction-records',
        component: './agent/account-transaction-records',
      },
    ],
  },
  {
    path: '/merchant-reports',
    icon: 'AreaChartOutlined',
    name: 'MerchantReports',
    // access: 'canReports',
    routes: [
      {
        path: '/merchant-reports',
        redirect: '/merchant-reports/daily',
      },
      {
        name: 'Daily',
        path: '/merchant-reports/daily',
        component: './reports/merchant-trx/daily',
      },
      {
        name: 'Merchant',
        path: '/merchant-reports/merchant',
        component: './reports/merchant-trx/merchant',
      },
    ],
  },
  {
    path: '/member-reports',
    icon: 'AreaChartOutlined',
    name: 'MemberReports',
    // access: 'canReports',
    routes: [
      {
        path: '/member-reports',
        redirect: '/member-reports/daily',
      },
      {
        name: 'Daily',
        path: '/member-reports/daily',
        component: './reports/member-trx/daily',
      },
      {
        name: 'Merchant',
        path: '/member-reports/merchant',
        component: './reports/member-trx/merchant',
      },
      {
        name: 'Member',
        path: '/member-reports/member',
        component: './reports/member-trx/member',
      },
    ],
  },
  {
    path: '/agent-reports',
    icon: 'AreaChartOutlined',
    name: 'AgentReports',
    // access: 'canReports',
    routes: [
      {
        path: '/agent-reports',
        redirect: '/agent-reports/daily',
      },
      {
        name: 'Daily',
        path: '/agent-reports/daily',
        component: './reports/agent/daily',
      },
      {
        name: 'Agent',
        path: '/agent-reports/agent',
        component: './reports/agent/agent',
      },
    ],
  },
  {
    path: '/system-settings',
    icon: 'SettingOutlined',
    name: 'System Settings',
    // access: 'canSystemSettings',
    routes: [
      {
        path: '/system-settings',
        redirect: '/system-settings/profile',
      },
      {
        name: 'Profile',
        path: '/system-settings/profile',
        component: './system-settings/profile',
      },
      {
        name: 'Users',
        path: '/system-settings/users',
        component: './system-settings/users',
      },
      {
        name: 'Roles',
        path: '/system-settings/roles',
        component: './system-settings/roles',
      },
      {
        name: 'Resources',
        path: '/system-settings/resources',
        component: './system-settings/resources',
      },
      {
        name: 'Dictionary',
        path: '/system-settings/dictonary',
        component: './system-settings/dictionary',
      },
      {
        name: 'Notice',
        path: '/system-settings/notice',
        component: './system-settings/notice',
      },
      {
        name: 'Private Messages',
        path: '/system-settings/privatemessage',
        component: './system-settings/privatemessage',
      },
      {
        name: 'Logo Setting',
        path: '/system-settings/logosetting',
        component: './system-settings/logosetting',
      },
    ],
  },
  {
    path: '/log-management',
    icon: 'ProfileOutlined',
    name: 'Log Management',
    // access: 'canLogManagement',
    routes: [
      {
        path: '/log-management',
        redirect: '/log-management/access-log',
      },
      {
        name: 'Access Log',
        path: '/log-management/access-log',
        component: './log-management/access-log',
      },
      {
        name: 'Operation Log',
        path: '/log-management/operation-log',
        component: './log-management/operation-log',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    component: './404',
  },
];
