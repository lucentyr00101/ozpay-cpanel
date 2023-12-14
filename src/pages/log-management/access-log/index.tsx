import type { FC } from 'react';
import { useRef } from 'react';
import { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { AccessLogItem, Pagination } from './data';
import type { ProColumns } from '@ant-design/pro-table';
import { fetchAccessLogs } from './service';
import styles from './style.less';
import SuccessImg from '@/assets/check-circle.svg';
import ErrorImg from '@/assets/error-circle.svg';
import { Access, useAccess, useIntl } from 'umi';
import { maxLength } from '@/global';
import Cookies from 'universal-cookie';
import { filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const AccessLog: FC = () => {
  // const actionRef = useRef<ActionType>();
  const t = useIntl();
  const access: any = useAccess();
  const cookies = new Cookies();
  const filterRef = useRef<ProFormInstance>();

  const pagination = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 20,
  };

  const [currentRow, setCurrentRow] = useState<AccessLogItem>();
  const [showDetail, setShowDetail] = useState<boolean>(false);

  function setFlexToAuto(childNum: number, auto: boolean = true) {
    const timeField = document.querySelector<HTMLElement>(
      `[class*="AccessLogTable"] .ant-row.ant-row-start div:nth-child(${childNum}) .ant-col.ant-form-item-label`,
    );
    if (timeField) {
      if (auto) {
        timeField.style.setProperty('flex', '0 0 auto');
      } else {
        timeField.style.setProperty('flex', '0 0 80px');
      }
    }
  }

  const columns: ProColumns<AccessLogItem>[] = [
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
      title: t.formatMessage({ id: 'table.userName' }),
      dataIndex: 'username',
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'table.source' }),
      dataIndex: 'source',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.type' }),
      dataIndex: 'type',
      search: false,
      width: 70,
      render: (_, value) => {
        return t.formatMessage({ id: 'table.' + value.type });
      },
    },
    {
      title: t.formatMessage({ id: 'table.success' }),
      dataIndex: 'success',
      search: false,
      width: 50,
      render: (_, value) => {
        return t.formatMessage({ id: 'table.' + value.success });
      },
    },
    {
      title: t.formatMessage({ id: 'table.createdTime' }),
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: t.formatMessage({ id: 'table.operatingSystem' }),
      dataIndex: 'os',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.userAgent' }),
      dataIndex: 'ua',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.ipAddress' }),
      dataIndex: 'ip',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.details' }),
      dataIndex: 'logId',
      hideInSearch: true,
      width: 50,
      render: (dom, entity) => {
        return (
          <Access
            accessible={access?.LogManagement.AccessLog}
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
  ];

  const actionDict = {
    'Sign In': t.formatMessage({ id: 'modal.login' }),
    'Sign Out': t.formatMessage({ id: 'modal.logout' }),
    error: 'ERROR',
  };

  const success = (action: string) => {
    return (
      <>
        <Row align="middle" className={styles.mb10}>
          <Col>
            <img src={SuccessImg} alt="success" />
            <span className={`${styles.details__text} ${styles.details__text_head}`}>
              {t.formatMessage({ id: 'modal.logdetails' })}
            </span>
          </Col>
        </Row>
        <Row align="middle" className={styles.mb10}>
          <Col>
            <span className={`${styles.details__text} ${styles.details__text_success}`}>
              {actionDict[action]} {t.formatMessage({ id: 'modal.successful' })}
            </span>
          </Col>
        </Row>
      </>
    );
  };

  const failed = (action: string) => {
    return (
      <>
        <Row align="middle" className={styles.mb10}>
          <Col>
            <img src={ErrorImg} alt="success" />
            <span className={`${styles.details__text} ${styles.details__text_head}`}>
              {t.formatMessage({ id: 'modal.logdetails' })}
            </span>
          </Col>
        </Row>
        <Row align="middle" className={styles.mb10}>
          <Col>
            <span className={`${styles.details__text} ${styles.details__text_failed}`}>
              {actionDict[action]} {t.formatMessage({ id: 'modal.failed' })}
            </span>
          </Col>
        </Row>
      </>
    );
  };

  const fetchAccessLogList = async (values: any, sort: any) => {
    const { username, createdAtRange, pageSize: size, current: page } = values;
    const filter: any = {
      size,
      page: page - 1,
      merchantUsername: username,
      sort: sort && sort.createdTime === 'ascend' ? 'Asc' : 'Desc',
    };

    if (createdAtRange) {
      const [fromDate, toDate] = createdAtRange;
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }

    const data = await fetchAccessLogs(filter);

    return data;
  };

  useEffect(() => {
    setFlexToAuto(1);
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('logs-access', filterRef);
    }
  }, [filterRef]);

  return (
    <Access
      accessible={access?.LogManagement.AccessLog}
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
        <ProTable<AccessLogItem, Pagination>
          // headerTitle="查询表格"
          // actionRef={actionRef}
          className="AccessLogTable"
          rowKey="key"
          cardBordered={true}
          pagination={pagination}
          request={fetchAccessLogList}
          columns={columns}
          options={false}
          formRef={filterRef}
          onSubmit={(v: any) => cookies.set(filterCookieMap['logs-access'], v, { path: '/' })}
          onReset={() => cookies.remove(filterCookieMap['logs-access'], { path: '/' })}
          search={{
            onCollapse: (collapsed: boolean) => {
              if (collapsed) {
                setFlexToAuto(1);
              } else {
                setFlexToAuto(1, false);
              }
            },
          }}
        />
        <Modal visible={showDetail} closable={false} footer={false} width={410} centered>
          {currentRow?.success === 'Yes'
            ? success(currentRow?.type || 'error')
            : failed(currentRow?.type || 'error')}
          <Row justify="end">
            <Button type="primary" size="middle" onClick={() => setShowDetail(false)}>
              {t.formatMessage({ id: 'modal.close' })}
            </Button>
          </Row>
        </Modal>
      </PageContainer>
    </Access>
  );
};

export default AccessLog;
