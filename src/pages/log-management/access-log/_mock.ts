import type { Request, Response } from 'express';
import { parse } from 'url';
import type { AccessLogItem, Params } from './data.d';

// mock - generate access log list
const genList = (current: number, pageSize: number) => {
  const tableListDataSource: AccessLogItem[] = [];
  const typeArray: string[] = ['Sign In', 'Sign Out'];
  const successArray: string[] = ['Yes', 'No'];
  const OSArray: string[] = ['Mac OSX', 'Windows 10', 'Windows 11', 'Ubuntu 20.04', 'Ubuntu 20.10'];

  for (let i = 0; i < pageSize; i += 1) {
    const randomType = Math.floor(Math.random() * typeArray.length);
    const randomSuccess = Math.floor(Math.random() * successArray.length);
    const randomOS = Math.floor(Math.random() * OSArray.length);
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      key: index,
      userName: `stockpennant_${index}`,
      type: typeArray[randomType],
      success: successArray[randomSuccess],
      createdAt: Date.now() - Math.floor(Math.random() * 2000),
      createdAtRange: [
        Date.now() - Math.floor(Math.random() * 2000),
        Date.now() - Math.floor(Math.random() * 2000),
      ],
      operatingSystem: OSArray[randomOS],
      userAgent:
        'Windows 10.1,Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
      ipAddress: '0.0.0.0',
      logId: Math.floor(1000 + Math.random() * 900000).toString(),
    });
  }
  tableListDataSource.reverse();
  return tableListDataSource;
};

const tableListDataSource = genList(1, 100);

function getAccessLogList(req: Request, res: Response, u: string) {
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
  'GET /api/logs/access': getAccessLogList,
};
