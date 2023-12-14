import type { Request, Response } from 'express';
import { parse } from 'url';
import type { DictionaryItem, Params } from './data.d';
import getDictionaryValuesList from './_mock-values';

// mock - generate withdrawal list
const genList = () => {
  const tableListDataSource: DictionaryItem[] = [];

  tableListDataSource.push(
    {
      key: 1,
      typeName: 'Withdrawal',
      code: 'W',
      sort: 1,
      status: true,
      remarks: 'Withdrawal',
    },
    {
      key: 2,
      typeName: 'Deposit',
      code: 'D',
      sort: 2,
      status: true,
      remarks: 'Deposit',
    },
    {
      key: 3,
      typeName: 'Transaction',
      code: 'T',
      sort: 3,
      status: false,
      remarks: 'Transaction',
    },
    {
      key: 4,
      typeName: 'Merchant',
      code: 'Merchant',
      sort: 5,
      status: true,
      remarks: 'Merchant',
    },
    {
      key: 5,
      typeName: 'Member',
      code: 'Member',
      sort: 5,
      status: true,
      remarks: 'Member',
    },
    {
      key: 6,
      typeName: 'Withdrawal Status',
      code: 'WS',
      sort: 6,
      status: true,
      remarks: 'WithdrawalStatus',
    },
    {
      key: 7,
      typeName: 'Deposit Status',
      code: 'DS',
      sort: 7,
      status: true,
      remarks: 'DepositStatus',
    },
    {
      key: 8,
      typeName: 'Transaction Types',
      code: 'TT',
      sort: 8,
      status: false,
      remarks: 'TransactionTypes',
    },
    {
      key: 9,
      typeName: 'Merchant Status',
      code: 'MerchantS',
      sort: 9,
      status: true,
      remarks: 'MerchantStatus',
    },
    {
      key: 10,
      typeName: 'Member Status',
      code: 'MemberS',
      sort: 10,
      status: true,
      remarks: 'MemberStatus',
    },
    {
      key: 11,
      typeName: 'Withdrawal Status',
      code: 'WS',
      sort: 11,
      status: true,
      remarks: 'WithdrawalStatus',
    },
    {
      key: 12,
      typeName: 'Deposit Status',
      code: 'DS',
      sort: 12,
      status: true,
      remarks: 'DepositStatus',
    },
    {
      key: 13,
      typeName: 'Transaction Types',
      code: 'TT',
      sort: 13,
      status: false,
      remarks: 'TransactionTypes',
    },
    {
      key: 14,
      typeName: 'Merchant Status',
      code: 'MerchantS',
      sort: 15,
      status: true,
      remarks: 'MerchantStatus',
    },
    {
      key: 15,
      typeName: 'Member Status',
      code: 'MemberS',
      sort: 15,
      status: true,
      remarks: 'MemberStatus',
    },
  );
  // tableListDataSource.reverse();
  return tableListDataSource;
};

const tableListDataSource = genList();

function getDictionaryList(req: Request, res: Response, u: string) {
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
  'GET /api/dictionary': getDictionaryList,
  'GET /api/dictionary/values': getDictionaryValuesList,
};
