import type { Request, Response } from 'express';
import { parse } from 'url';
import type { RoleItem, Params } from './data.d';

// mock - generate withdrawal list
const genList = () => {
  const tableListDataSource: RoleItem[] = [];

  tableListDataSource.push(
    {
      key: 1,
      name: 'Role1',
      code: 'role',
      sort: 1,
      status: true,
      remarks: 'Role',
    },
    {
      key: 2,
      name: 'Role2',
      code: 'r2',
      sort: 2,
      status: false,
      remarks: 'Role',
    },
    {
      key: 3,
      name: 'Merchant1',
      code: 'merchant',
      sort: 3,
      status: false,
      remarks: 'Merchant',
    },
    {
      key: 4,
      name: 'Merchant2',
      code: 'm2',
      sort: 4,
      status: true,
      remarks: 'Merchant',
    },
    {
      key: 5,
      name: 'Admin1',
      code: 'admin',
      sort: 5,
      status: true,
      remarks: 'Admin',
    },
    {
      key: 6,
      name: 'Admin2',
      code: 'a2',
      sort: 6,
      status: false,
      remarks: 'Admin',
    },
  );
  // tableListDataSource.reverse();
  return tableListDataSource;
};

const tableListDataSource = genList();

function getRoleList(req: Request, res: Response, u: string) {
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
  'GET /api/role': getRoleList,
};
