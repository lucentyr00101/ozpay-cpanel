import type { FC } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { OperationLogItem, Pagination } from './data';
import type { ProColumns } from '@ant-design/pro-table';
import { fetchOperationLogs } from './service';
import { Result } from 'antd';
import styles from './style.less';
import { Access, useAccess, useIntl } from 'umi';
import ViewDetails from '@/components/Logs/OperationLogs/View';
import { maxLength } from '@/global';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const AccessLog: FC = () => {
  // const actionRef = useRef<ActionType>();
  const t = useIntl();
  const [currentRow, setCurrentRow] = useState<OperationLogItem>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const cookies = new Cookies();
  const filterRef = useRef<ProFormInstance>();

  const access: any = useAccess();

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 20,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  function setFlexToAuto(childNum: number, auto: boolean = true) {
    console.log(childNum);
    const timeField = document.querySelector<HTMLElement>(
      `[class*="OperationLogTable"] .ant-row.ant-row-start div:nth-child(${childNum}) .ant-col.ant-form-item-label`,
    );
    if (timeField) {
      if (auto) {
        timeField.style.setProperty('flex', '0 0 auto');
      } else {
        timeField.style.setProperty('flex', '0 0 80px');
      }
    }
  }

  const columns: ProColumns<OperationLogItem>[] = [
    {
      title: t.formatMessage({ id: 'table.time' }),
      dataIndex: 'createdAtRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      fieldProps: {
        placeholder: [
          t.formatMessage({ id: 'table.startDate' }),
          t.formatMessage({ id: 'table.endDate' }),
        ],
      },
    },
    {
      title: t.formatMessage({ id: 'table.keyword' }),
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: {
        placeholder: [t.formatMessage({ id: 'table.keywordTerm' })],
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'table.moduleName' }),
      dataIndex: 'module',
      hideInSearch: true,
      render: (_, value) => {
        return t.formatMessage({ id: 'menu.operation-log.' + value.module });
      },
    },
    {
      title: t.formatMessage({ id: 'table.operationType' }),
      dataIndex: 'opType',
      hideInSearch: true,
      render: (_, value) => {
        return t.formatMessage({ id: 'menu.operation-log.type.' + value.opType });
      },
    },
    {
      title: t.formatMessage({ id: 'table.url' }),
      dataIndex: 'url',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.success' }),
      dataIndex: 'success',
      hideInSearch: true,
      render: (_, value) => {
        return t.formatMessage({ id: 'table.' + value.success });
      },
    },
    {
      title: t.formatMessage({ id: 'table.createdBy' }),
      dataIndex: 'createdBy',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.createdTime' }),
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: t.formatMessage({ id: 'table.ipAddress' }),
      dataIndex: 'createdIp',
      hideInSearch: true,
    },
    {
      title: t.formatMessage({ id: 'table.details' }),
      dataIndex: 'logId',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <Access
            accessible={access?.LogManagement.OperationLog}
            key="add"
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                onClick={() => {
                  setCurrentRow(entity);
                  setShowDetail(true);
                }}
              >
                {t.formatMessage({ id: 'modal.details' })}
              </a>
            }
          >
            <a
              onClick={() => {
                setCurrentRow(entity);
                setShowDetail(true);
              }}
            >
              {t.formatMessage({ id: 'modal.details' })}
            </a>
          </Access>
        );
      },
    },
    { title: 'Class Name', dataIndex: 'className', hideInTable: true, hideInSearch: true },
    { title: 'Method Name', dataIndex: 'methodName', hideInTable: true, hideInSearch: true },
    { title: 'User Agent', dataIndex: 'userAgent', hideInTable: true, hideInSearch: true },
    { title: 'Parameters', dataIndex: 'parameters', hideInTable: true, hideInSearch: true },
    { title: 'Result', dataIndex: 'result', hideInTable: true, hideInSearch: true },
  ];

  const fetchOperationLogList = async (values: any, sort: any) => {
    const { keyword, createdAtRange, pageSize: size, current: page } = values;
    const filter: any = {
      size,
      page: page - 1,
      keyword,
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const data = await fetchOperationLogs(filter);

    return data;
  };

  useEffect(() => {
    setFlexToAuto(1);
  }, []);

  useEffect(() => {
    if (!showDetail) setCurrentRow(undefined);
  }, [showDetail]);

  useEffect(() => {
    if (filterRef) {
      setFilters('agent-account-records', filterRef);
    }
  }, [filterRef]);

  return (
    <Access
      accessible={access?.LogManagement.OperationLog}
      fallback={
        <Result
          status="404"
          style={{
            height: '100%',
            background: '#fff',
          }}
          title={t.formatMessage({ id: 'messages.sorry' })}
          subTitle={t.formatMessage({ id: 'messages.notAuthorizedAccess' })}
        />
      }
    >
      <PageContainer title={false}>
        <ProTable<OperationLogItem, Pagination>
          // headerTitle="查询表格"
          // actionRef={actionRef}
          className={styles.OperationLogTable}
          rowKey="key"
          cardBordered={true}
          pagination={paginationProps}
          request={fetchOperationLogList}
          columns={columns}
          options={false}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['agent-account-records'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['agent-account-records'], { path: '/' })}
          search={{
            labelWidth: 'auto',
            onCollapse: (collapsed: boolean) => {
              if (collapsed) {
                setFlexToAuto(1);
              } else {
                setFlexToAuto(3);
                setFlexToAuto(1, false);
              }
            },
          }}
        />
        <ViewDetails
          currentRow={currentRow}
          visible={showDetail}
          close={() => setShowDetail(false)}
        />
      </PageContainer>
    </Access>
  );
};

export default AccessLog;
