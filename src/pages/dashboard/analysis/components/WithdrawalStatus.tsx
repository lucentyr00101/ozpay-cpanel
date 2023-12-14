import { RingProgress } from '@ant-design/charts';
import { Card, Col, Row } from 'antd';
import { Progress } from '@ant-design/plots';

import styles from '../style.less';
import { useIntl } from 'umi';

const completedRingProgressConfig = {
  height: 75,
  width: 75,
  color: 'rgba(24, 144, 255, 0.45)',
};

const cancelledRingProgressConfig = {
  height: 75,
  width: 75,
  color: 'rgba(24, 144, 255, 0.45)',
};

const inProgressRingProgressConfig = {
  height: 75,
  width: 75,
  color: 'rgb(24, 144, 255)',
};

const CompletedConfig = {
  height: 40,
  width: 350,
  autoFit: false,
  barWidthRatio: 0.3,
  color: ['#58AFFF', '#E8EDF3'],
};

const CancelledConfig = {
  height: 40,
  width: 350,
  autoFit: false,
  barWidthRatio: 0.3,
  color: ['#58AFFF', '#E8EDF3'],
};

const InProgressConfig = {
  height: 40,
  width: 350,
  autoFit: false,
  barWidthRatio: 0.3,
  color: ['#58AFFF', '#E8EDF3'],
};

const WithdrawalStatus = ({ withdrawalStatusPercentage }: {withdrawalStatusPercentage: any}) => {
  const t = useIntl();
  return (
      <>
    <Card>
      <Row style={{ textAlign: 'center', padding: '0 10px', marginBottom: '2.5rem' }}>
        <Col sm={24} md={12} xl={8}>
          <div className={styles.pieChartTitle}>
            <span>{t.formatMessage({ id: 'pages.dashboard.completed' })}</span>
          </div>
          <RingProgress {...completedRingProgressConfig} percent={withdrawalStatusPercentage.completed || 0}/>
        </Col>
        <Col sm={24} md={12} xl={8}>
          <div className={styles.pieChartTitle}>
          <span>{t.formatMessage({ id: 'pages.dashboard.cancelled' })}</span>
          </div>
          <RingProgress {...cancelledRingProgressConfig} percent={withdrawalStatusPercentage.cancelled || 0}/>
        </Col>
        <Col sm={24} md={12} xl={8}>
          <div className={styles.pieChartTitle}>
          <span>{t.formatMessage({ id: 'pages.dashboard.underReview' })}</span>
          </div>
          <RingProgress {...inProgressRingProgressConfig} percent={withdrawalStatusPercentage.underreview || 0}/>
        </Col>
      </Row>
      <Row>
        <Col sm={24} md={24} xl={24}>
          <div className={styles.progressChartTitle}>
            <span className={styles.progressChartTitleStatus}>{t.formatMessage({ id: 'pages.dashboard.completed' })}</span>
            <span>{withdrawalStatusPercentage.completed * 100 || 0}%</span>
          </div>
          <Progress {...CompletedConfig} percent={withdrawalStatusPercentage.completed || 0}/>
        </Col>
      </Row>
      <Row>
        <Col sm={24} md={24} xl={24}>
          <div className={styles.progressChartTitle}>
            <span className={styles.progressChartTitleStatus}>{t.formatMessage({ id: 'pages.dashboard.cancelled' })}</span>
            <span>{withdrawalStatusPercentage.cancelled * 100 || 0}%</span>
          </div>
          <Progress {...CancelledConfig} percent={withdrawalStatusPercentage.cancelled || 0}/>
        </Col>
      </Row>
      <Row>
        <Col sm={24} md={24} xl={24}>
          <div className={styles.progressChartTitle}>
            <span className={styles.progressChartTitleStatus}>{t.formatMessage({ id: 'pages.dashboard.underReview' })}</span>
            <span>{withdrawalStatusPercentage.underreview * 100 || 0}%</span>
          </div>
          <Progress {...InProgressConfig} percent={withdrawalStatusPercentage.underreview || 0}/>
        </Col>
      </Row>
    </Card>
  </>
  )
}

export default WithdrawalStatus;
