import { Card, Col, Row, Typography, Spin } from 'antd';
import type { FC } from 'react';
import { useState, useEffect, memo, useRef } from 'react';
import { useIntl } from 'umi';
import { merchantWithdrawalSummary } from '@/pages/transaction/shared/withdrawal/service';
import moment from 'moment';

interface Props {
  refreshInterval: string;
  filter: any;
}

interface SummaryData {
  order: number;
  inProg: number;
  timeOut: number;
  review: number;
  completed: number;
  cancelled: number;
  waiting: number;
  orderCount: number;
  inProgCount: number;
  reviewCount: number;
  completedCount: number;
  cancelledCount: number;
  waitingCount: number;
  timeOutCount: number;
}

const MerchantWithdrawalSummary: FC<Props> = ({ refreshInterval, filter }) => {
  // let interval: any;
  const { Text } = Typography;
  const t = useIntl();
  const [fetching, setFetching] = useState(false);
  const [summaryData, setData] = useState<SummaryData>({
    order: 0,
    inProg: 0,
    review: 0,
    timeOut: 0,
    completed: 0,
    cancelled: 0,
    waiting: 0,
    orderCount: 0,
    inProgCount: 0,
    reviewCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    waitingCount: 0,
    timeOutCount: 0,
  });
  const interval = useRef<any>();

  const fetchSummary = async () => {
    if (filter) {
      const { createdAtRange, orderId, status, merchant, paymentTypeTag, amountInSearch, remark } =
        filter;
      const _filter: any = {
        ...(orderId && { orderId }),
        ...(status && { status }),
        ...(remark && { remark }),
        ...(paymentTypeTag && { paymentTypeTag }),
      };

      if (amountInSearch?.length) {
        const [minAmount, maxAmount] = amountInSearch;
        _filter.minAmount = minAmount.toFixed(2);
        _filter.maxAmount = maxAmount.toFixed(2);
      }

      if (createdAtRange) {
        const [fromDate, toDate] = createdAtRange;
        _filter.fromDate = moment(fromDate).format('YYYY-MM-DD HH:mm:ss');
        _filter.toDate = moment(toDate).format('YYYY-MM-DD HH:mm:ss');
      }

      if (merchant) {
        const { username: _username } = merchant.sysUser;
        if (_username) {
          _filter.merchantUsername = _username;
        }
      }

      setFetching(true);
      const { data } = await merchantWithdrawalSummary(_filter);
      const _data = {
        order: data.totalWithdrawalAmount || 0,
        timeOut: data.totalTimedOutWithdrawalAmount || 0,
        inProg: data.totalInProgressWithdrawalAmount || 0,
        review: data.totalUnderReviewWithdrawalAmount || 0,
        completed: data.totalCompletedWithdrawalAmount || 0,
        cancelled: data.totalCancelledWithdrawalAmount || 0,
        waiting: data.totalWaitingWithdrawalAmount || 0,
        orderCount: data.totalWithdrawal || 0,
        inProgCount: data.totalInProgressWithdrawal || 0,
        timeOutCount: data.totalTimedOutWithdrawal || 0,
        reviewCount: data.totalUnderReviewWithdrawal || 0,
        completedCount: data.totalCompletedWithdrawal || 0,
        cancelledCount: data.totalCancelledWithdrawal || 0,
        waitingCount: data.totalWaitingWithdrawal || 0,
      };
      setData(_data);
      setFetching(false);
    }
  };

  const handleFetchInterval = () => {
    if (refreshInterval) {
      const seconds = +refreshInterval * 1000;
      clearInterval(interval.current);
      interval.current = setInterval(() => fetchSummary(), seconds);
    } else {
      clearInterval(interval.current);
    }
  };

  useEffect(() => {
    fetchSummary();
    handleFetchInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (!!refreshInterval) handleFetchInterval();
    else clearInterval(interval.current);
    return () => clearInterval(interval.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  return (
    <Card
      bordered={false}
      style={{ marginBottom: 24 }}
      bodyStyle={{ padding: 8, backgroundColor: '#E6F7FE' }}
    >
      <Spin spinning={fetching}>
        <Row gutter={20} justify="space-between" style={{ padding: '0 2rem' }}>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.All Orders' })} : </Text>
            <Text>
              {summaryData.order.toFixed(2)}/{summaryData.orderCount}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.Waiting' })} :</Text>
            <Text>
              {summaryData.waiting.toFixed(2)}/{summaryData.waitingCount}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.In Progress' })} : </Text>
            <Text>
              {summaryData.inProg.toFixed(2)}/{summaryData.inProgCount}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.Under Review' })} :</Text>
            <Text>
              {summaryData.review.toFixed(2)}/{summaryData.reviewCount}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.Completed' })} : </Text>
            <Text>
              {summaryData.completed.toFixed(2)}/{summaryData.completedCount}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.Cancelled' })} : </Text>
            <Text>
              {summaryData.cancelled.toFixed(2)}/{summaryData.cancelledCount}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">{t.formatMessage({ id: 'table.Timed Out' })} :</Text>
            <Text>
              {summaryData.timeOut.toFixed(2)}/{summaryData.timeOutCount}
            </Text>
          </Col>
        </Row>
      </Spin>
    </Card>
  );
};

export default memo(MerchantWithdrawalSummary);
