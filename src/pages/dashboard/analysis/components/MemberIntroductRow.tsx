import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Row, Tooltip } from 'antd';

import styles from '../style.less';
import { ChartCard } from './Charts';
import { useIntl } from 'umi';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const MemberIntroduceRow = ({
  todayValue,
  isMerchant = false,
  isAgent = false,
}: {
  todayValue: any;
  isMerchant?: boolean;
  isAgent?: boolean;
}) => {
  const t = useIntl();

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <ChartCard
          className={styles.chartCard}
          bordered={true}
          title={t.formatMessage({ id: 'pages.dashboard.todayWithdrawals' })}
          action={
            <Tooltip title={t.formatMessage({ id: 'pages.dashboard.todayWithdrawals' })}>
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={() => todayValue.totalWithdrawalAmount}
          footerLine={false}
          footer={
            isMerchant ? (
              <p>{t.formatMessage({ id: 'pages.dashboard.allMerchants' })}</p>
            ) : isAgent ? (
              <p>{t.formatMessage({ id: 'pages.dashboard.allAgents' })}</p>
            ) : (
              <p>{t.formatMessage({ id: 'pages.dashboard.allMembers' })}</p>
            )
          }
        />
      </Col>
      <Col {...topColResponsiveProps}>
        <ChartCard
          className={styles.chartCard}
          bordered={true}
          title={t.formatMessage({ id: 'pages.dashboard.todayDeposit' })}
          action={
            <Tooltip title={t.formatMessage({ id: 'pages.dashboard.todayDeposit' })}>
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={() => todayValue.totalDepositAmount}
          footerLine={false}
          footer={
            isMerchant ? (
              <p>{t.formatMessage({ id: 'pages.dashboard.allMerchants' })}</p>
            ) : isAgent ? (
              <p>{t.formatMessage({ id: 'pages.dashboard.allAgents' })}</p>
            ) : (
              <p>{t.formatMessage({ id: 'pages.dashboard.allMembers' })}</p>
            )
          }
        />
      </Col>
      <Col {...topColResponsiveProps}>
        <ChartCard
          className={styles.chartCard}
          bordered={true}
          title={t.formatMessage({ id: 'pages.dashboard.todayFees' })}
          action={
            <Tooltip title={t.formatMessage({ id: 'pages.dashboard.todayFees' })}>
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={() => todayValue.totalDepositFee}
        />
      </Col>
      {todayValue.totalEarnings !== undefined ? (
        <Col {...topColResponsiveProps}>
          <ChartCard
            className={styles.chartCard}
            bordered={true}
            title={t.formatMessage({ id: 'pages.dashboard.todayEarnings' })}
            action={
              <Tooltip title={t.formatMessage({ id: 'pages.dashboard.todayEarnings' })}>
                <InfoCircleOutlined />
              </Tooltip>
            }
            total={() => todayValue.totalEarnings || '0.00'}
          />
        </Col>
      ) : (
        <Col {...topColResponsiveProps}>
          <ChartCard
            className={styles.chartCard}
            bordered={true}
            title={t.formatMessage({ id: 'pages.dashboard.todayVisitors' })}
            action={
              <Tooltip title={t.formatMessage({ id: 'pages.dashboard.todayVisitors' })}>
                <InfoCircleOutlined />
              </Tooltip>
            }
            total={() => todayValue.visitorNumberToday}
          />
        </Col>
      )}
    </Row>
  );
};

export default MemberIntroduceRow;
