import type { Request, Response } from 'express';
import { parse } from 'url';
import type { UserItem, Params } from './data.d';

// mock - generate withdrawal list
const genList = () => {
  const tableListDataSource: UserItem[] = [];

  tableListDataSource.push(
    {
      key: 1,
      name: 'HelloWorld',
      userType: 'Merchant',
      roles: 1,
      status: true,
      createdTime: Date.now() - Math.floor(Math.random() * 2000),
      createdBy: "Admin123",
      remarks: 'Role',
    },
    {
      key: 2,
      name: 'Lala',
      userType: 'r2',
      roles: 2,
      status: false,
      createdTime: Date.now() - Math.floor(Math.random() * 2000),
      createdBy: "Admin123",
      remarks: 'Role',
    },
    {
      key: 3,
      name: 'Merchant1',
      userType: 'merchant',
      roles: 3,
      status: false,
      createdTime: Date.now() - Math.floor(Math.random() * 2000),
      createdBy: "Admin",
      remarks: 'Merchant',
    },
    {
      key: 4,
      name: 'Merchant2',
      userType: 'm2',
      roles: 4,
      status: true,
      createdTime: Date.now() - Math.floor(Math.random() * 2000),
      createdBy: "Admin123",
      remarks: 'Merchant',
    },
    {
      key: 5,
      name: 'Admin1',
      userType: 'admin',
      roles: 5,
      status: true,
      createdTime: Date.now() - Math.floor(Math.random() * 2000),
      createdBy: "Admin",
      remarks: 'Admin',
    },
    {
      key: 6,
      name: 'Admin2',
      userType: 'a2',
      roles: 6,
      status: false,
      createdTime: Date.now() - Math.floor(Math.random() * 2000),
      createdBy: "Admin123",
      remarks: 'Admin',
    },
  );
  // tableListDataSource.reverse();
  return tableListDataSource;
};

const tableListDataSource = genList();

function getUserList(req: Request, res: Response, u: string) {
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
  'GET /api/user': getUserList,
};
