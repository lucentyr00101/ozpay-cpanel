import type { Request, Response } from 'express';
import { parse } from 'url';
import type { OperationLogItem, Params } from './data.d';

// mock - generate access log list
const genList = (current: number, pageSize: number) => {
  const tableListDataSource: OperationLogItem[] = [];
  const successArray: string[] = ['Yes', 'No'];

  for (let i = 0; i < pageSize; i += 1) {
    const randomSuccess = Math.floor(Math.random() * successArray.length);
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      key: index,
      logId: Math.floor(1000 + Math.random() * 900000).toString(),
      moduleName: `module_${index}`,
      operationType: 'Query',
      url: '/sysDictType/dropDown',
      success: successArray[randomSuccess],
      createdAt: new Date(+new Date() - Math.floor(Math.random() * 10000000000)),
      createdBy: 'Chuy2022',
      createdAtRange: [
        Date.now() - Math.floor(Math.random() * 2000),
        Date.now() - Math.floor(Math.random() * 2000),
      ],
      ipAddress: '0.0.0.0',
      className: 'vip.xiaonuo.sys.modular.dict.controller.SysDictTypeController',
      methodName: 'Dropdown',
      requestMethod: 'GET',
      userAgent:
        'Windows 10.1,Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
      parameters: '{"code":"consts_type"}',
      result:
        '{"code":200,"data":[{"code":"CRYPTOGRAM","value":"加密配置"},{"code":"DEFAULT","value":"默认常量"},{"code":"ALIYUN_SMS","value":"阿里云短信"},{"code":"TENCENT_SMS","value":"腾讯云短信"},{"code":"EMAIL","value":"邮件配置"},{"code":"FILE_PATH","value":"文件上传路径"},{"code":"OAUTH","value":"Oauth配置"}],"message":"请求成功","success":true}',
    });
  }
  tableListDataSource.reverse();
  return tableListDataSource;
};

const tableListDataSource = genList(1, 100);

function getOperationLogList(req: Request, res: Response, u: string) {
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
  'GET /api/logs/operation': getOperationLogList,
};
