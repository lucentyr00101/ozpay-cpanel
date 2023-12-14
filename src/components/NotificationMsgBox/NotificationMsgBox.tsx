import { NotificationTwoTone } from '@ant-design/icons';
import { Card, Row, Col } from 'antd';
import type { FC } from 'react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { getNotices } from './service';

import styles from './index.less';

const Info: FC<{
  value: React.ReactNode;
  bordered?: boolean;
}> = ({ value, bordered }) => (
  <div className={styles.headerInfo}>
    <span>{value}</span>
    {bordered && <em />}
  </div>
);

const NotificationMsgBox = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const handleFetchNoticeList = async () => {
    const params = {
      size: 5,
      page: 0,
    };
    const response = await getNotices(params);
    const sort = (response?.data).sort((a, b) => {
      return a.sort - b.sort;
    });
    setData(sort);
    return response;
  };
  useEffect(() => {
    handleFetchNoticeList();
  }, []);

  useImperativeHandle(ref, () => ({
    handleFetchNoticeList,
  }));

  return (
    <Card bordered={false} style={{ marginBottom: 24 }} bodyStyle={{ padding: 15 }}>
      <Row align="middle">
        <Col sm={1} xs={3}>
          <NotificationTwoTone style={{ fontSize: '2rem', padding: '10px' }} />
        </Col>
        <Col sm={23} xs={23}>
          <Marquee speed={40}>
            {data.map((item: any) => {
              if (item.status == 'Enable') {
                return <Info key={item.sort} value={item.content} bordered />;
              }
            })}
          </Marquee>
        </Col>
      </Row>
    </Card>
  );
});
export default NotificationMsgBox;
