import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Row, Tooltip } from 'antd';

import { ChartCard } from './Charts';
import styles from '../style.less';
import { useIntl } from 'umi';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const MerchantIntroduceRow = ({todayMerchantValue}: {todayMerchantValue: any }) => {
  const t = useIntl();

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <ChartCard
          className={styles.chartCard}
          bordered={true}
          title={t.formatMessage({ id: 'pages.dashboard.currentBalance' })}
          action={
            <Tooltip title={t.formatMessage({ id: 'pages.dashboard.currentBalance' })}>
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={() => todayMerchantValue.balance || '0.00'}
        />
      </Col>
     { todayMerchantValue.totalDepositEarnings !== undefined ? 
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
          total={() => todayMerchantValue.totalDepositEarnings || '0.00'}
        />
      </Col>
    :
     <Col {...topColResponsiveProps}>
      <ChartCard
        className={styles.chartCard}
        bordered={true}
        title={t.formatMessage({ id: 'pages.dashboard.totalFeesPaid' })}
        action={
          <Tooltip title={t.formatMessage({ id: 'pages.dashboard.totalFeesPaid' })}>
            <InfoCircleOutlined />
          </Tooltip>
        }
        total={() => todayMerchantValue.totalDepositFees || '0.00'}
      />
   </Col>
     }
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
          total={() => todayMerchantValue.totalDepositAmount || '0.00'}
          footerLine={true}
          footer={
            <>
              <span className={styles.footerLabel}>{t.formatMessage({ id: 'pages.dashboard.numberOfDeposits' })}</span>
              <span>{todayMerchantValue.totalDepositTimes}</span>
            </>
          }
        />
      </Col>
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
          total={() => todayMerchantValue.totalWithdrawalAmount || '0.00'}
          footerLine={true}
          footer={
            <>
              <span className={styles.footerLabel}>{t.formatMessage({ id: 'pages.dashboard.numberOfWithdrawals' })}</span>
              <span>{todayMerchantValue.totalWithdrawalTimes}</span>
            </>
          }
        />
      </Col>
    </Row>
  )
};

export default MerchantIntroduceRow;
