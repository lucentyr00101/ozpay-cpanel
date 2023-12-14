import type { Request, Response } from 'express';
import { parse } from 'url';
import type { ResourceItem, Params } from './data.d';

// mock - generate withdrawal list
const genList = () => {
  const tableListDataSource: ResourceItem[] = [];

  tableListDataSource.push(
    {
      key: 1,
      name: 'Dashboard',
      type: 'Directory',
      router: "/",
      sort: 1,
      children: null
    },
    {
      key: 2,
      name: 'Transaction',
      type: 'Directory',
      router: "/",
      sort: 2,
      children: [
        {
          key: 3,
          name: 'Withdrawal',
          type: 'Menu',
          router: "",
          sort: 3,
          children: [
            {
              key: 4,
              name: 'List',
              type: 'Button',
              router: "",
              sort: 4,
            },
            {
              key: 5,
              name: 'Add',
              type: 'Button',
              router: "",
              sort: 5,

            },
            {
              key: 6,
              name: 'Import',
              type: 'Button',
              router: "",
              sort: 6,

            },
            {
              key: 7,
              name: 'Cancel',
              type: 'Button',
              router: "",
              sort: 7,
            },
          ]
        },
        {
          key: 8,
          name: 'Deposit',
          type: 'Menu',
          router: "",
          sort: 8,
          children: [
            {
              key: 9,
              name: 'List',
              type: 'Button',
              router: "",
              sort: 9,
            },
            {
              key: 10,
              name: 'Add',
              type: 'Button',
              router: "",
              sort: 10,

            },
            {
              key: 11,
              name: 'Import',
              type: 'Button',
              router: "",
              sort: 11,

            },
            {
              key: 12,
              name: 'Cancel',
              type: 'Button',
              router: "",
              sort: 12,
            },
          ]
        },
        {
          key: 13,
          name: 'Payment Type',
          type: 'Menu',
          router: "",
          sort: 13,
          children: [
            {
              key: 14,
              name: 'List',
              type: 'Button',
              router: "",
              sort: 14,
            },
            {
              key: 15,
              name: 'Add',
              type: 'Button',
              router: "",
              sort: 15,

            },
            {
              key: 16,
              name: 'Import',
              type: 'Button',
              router: "",
              sort: 16,

            },
            {
              key: 17,
              name: 'Cancel',
              type: 'Button',
              router: "",
              sort: 17,
            },
          ]
        },
        {
          key: 18,
          name: 'Account Transaction Record',
          type: 'Menu',
          router: "",
          sort: 18,
        },

      ]
    },
    {
      key: 19,
      name: 'Merchant',
      type: 'Directory',
      router: "/",
      sort: 19,
      children: [
        {
          key: 20,
          name: 'Merchant List',
          type: 'Menu',
          router: "/",
          sort: 20,
          children: [
            {
              key: 21,
              name: 'List',
              type: 'Button',
              router: "",
              sort: 21,
            },
            {
              key: 22,
              name: 'Add',
              type: 'Button',
              router: "",
              sort: 22,

            },
            {
              key: 23,
              name: 'Cancel',
              type: 'Button',
              router: "",
              sort: 23,
            },
          ]
        }
      ]
    },
    {
      key: 24,
      name: 'Reports',
      type: 'Directory',
      router: "",
      sort: 24,
      children: [
        {
          key: 25,
          name: 'Daily',
          type: 'Menu',
          router: "",
          sort: 25,
        },
        {
          key: 26,
          name: 'Merchant',
          type: 'Menu',
          router: "",
          sort: 26,
        },
        {
          key: 27,
          name: 'Member',
          type: 'Menu',
          router: "",
          sort: 27,
        }
      ]
    },
    {
      key: 28,
      name: 'System Setting',
      type: 'Directory',
      router: "",
      sort: 28,
      children: [
        {
          key: 29,
          name: 'Profile',
          type: 'Menu',
          router: "",
          sort: 29,
        },
        {
          key: 30,
          name: 'Users',
          type: 'Menu',
          router: "",
          sort: 30,
        },
        {
          key: 31,
          name: 'Roles',
          type: 'Menu',
          router: "",
          sort: 31,
        },
        {
          key: 32,
          name: 'Resources',
          type: 'Menu',
          router: "",
          sort: 32,
        },
        {
          key: 33,
          name: 'Dictionary',
          type: 'Menu',
          router: "",
          sort: 33,
        }
      ]
    },
    {
      key: 34,
      name: 'Log Management',
      type: 'Directory',
      router: "",
      sort: 34,
      children: [
        {
          key: 35,
          name: 'Access Log',
          type: 'Menu',
          router: "",
          sort: 35,
        },
        {
          key: 36,
          name: 'Operation Log',
          type: 'Menu',
          router: "",
          sort: 36,
        }
      ]
    },
  );
  // tableListDataSource.reverse();
  return tableListDataSource;
};

const tableListDataSource = genList();

function getResourceList(req: Request, res: Response, u: string) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as Params;

  let dataSource = [...tableListDataSource].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );
  if (params.sorter) {
    const sorter = JSON.parse(params.sorter as any);
    dataSource = dataSource.sort((prev, next) => {
      let sortNumber = 0;
      Object.keys(sorter).forEach((key) => {
        if (sorter[key] === 'descend') {
          if (prev[key] - next[key] > 0) {
            sortNumber += -1;
          } else {
            sortNumber += 1;
          }
          return;
        }
        if (prev[key] - next[key] > 0) {
          sortNumber += 1;
        } else {
          sortNumber += -1;
        }
      });
      return sortNumber;
    });
  }
  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as Record<string, string[]>;
    if (Object.keys(filter).length > 0) {
      dataSource = dataSource.filter((item) => {
        return Object.keys(filter).some((key) => {
          if (!filter[key]) {
            return true;
          }
          if (filter[key].includes(`${item[key]}`)) {
            return true;
          }
          return false;
        });
      });
    }
  }

  // if (params.name) {
  //   dataSource = dataSource.filter((data) => data.name.includes(params.name || ''));
  // }

  let finalPageSize = 10;
  if (params.pageSize) {
    finalPageSize = parseInt(`${params.pageSize}`, 10);
  }

  const result = {
    data: dataSource,
    total: tableListDataSource.length,
    success: true,
    pageSize: finalPageSize,
    current: parseInt(`${params.currentPage}`, 10) || 1,
  };

  return res.json(result);
}

export default {
  'GET /api/resource': getResourceList,
};
