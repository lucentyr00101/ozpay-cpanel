import type { FC} from "react";
import { useEffect} from "react";
import { Suspense, useState } from "react";

import { Card, Col, DatePicker, Radio, Result, Row, Tabs } from "antd";
import { Column, Line } from "@ant-design/plots";
import { GridContent, PageContainer, PageLoading } from "@ant-design/pro-layout";

import moment from "moment";

import MemberIntroductRow from "../analysis/components/MemberIntroductRow";
import WithdrawalStatus from "../analysis/components/WithdrawalStatus";

import styles from './style.less';
import { Access, useAccess, useIntl, useModel } from "umi";
import { fetchMerchantAmounts, fetchMerchantWithdrawalStatusPercentage, getMerchantLastSevenDays, merchantFinanceByMerchant } from "./service";
import type { RangePickerProps } from "antd/es/date-picker/generatePicker";
import MerchantIntroduceRow from "../analysis/components/MerchantIntroductRow";
import NotificationMsgBox from "../../../components/NotificationMsgBox/NotificationMsgBox";
import { USER_TYPE } from "@/components/enums/dictionary/dictionary.enum";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const transactionTypes = {
  Withdrawal:'Withdrawal',
  Deposit:'Deposit',
  Fee:'Fee',
}

type RangePickerValue = RangePickerProps<moment.Moment>['value'];
  
const Merchant: FC = () => {
  const access: any = useAccess();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  // const roles = currentUser?.grantedRoles.map((value: { name: any; })=> value.name);

  const t = useIntl();
  // const firstDayOfCurrentYear = new Date(new Date().getFullYear(), 0, 1);
  const currentWeekOfCurrentDay =new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6);
  const lastWeekOfCurrentDay =new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 11);
  const today = new Date();

  //Admin
  const [rangePickerValue, setRangePickerValue] = useState<RangePickerValue>();
  const [withdrawalStatusPercentage, setWithdrawalStatusPercentage] = useState({});
  const [todayValue, setTodayValue] = useState({});
  const [transactionOverviewData, setTransactionOverviewData] = useState([]);
  const [transactionOverviewMax, setTransactionOverviewMax] = useState(1200);
  const [feeLineChartMax, setFeeLineChartMax] = useState(8000);
  const [withdrawalColumnChartMax, setWithdrawalColumnChartMax] = useState(8000);
  const [despositColumnChartMax, setDespositColumnChartMax] = useState(8000);

  //Merchant
  const [todayMerchantValue, setTodayMerchantValue] = useState({});
  const [withdrawalAmountsRangePickerValue, setWithdrawalAmountsRangePickerValue] = useState<RangePickerValue>([moment(lastWeekOfCurrentDay), moment(today, 'yyyy-MM-DD')]);
  const [withdrawalAmountsRadioValue, setWithdrawalAmountsRadioValue] = useState('All Day');
  const [withdrawalAmountsData, setWithdrawalAmountsData] = useState([]);

  const [depositAmountsRangePickerValue, setDepositAmountsRangePickerValue] = useState<RangePickerValue>([moment(lastWeekOfCurrentDay), moment(today,'yyyy-MM-DD')]);
  const [despositAmountsRadioValue, setDespositAmountsRadioValue] = useState('All Day');
  const [depositAmountsData, setDepositAmountsData] = useState([]);

  const [feeAmountsRangePickerValue, setFeeAmountsRangePickerValue] = useState<RangePickerValue>([moment(currentWeekOfCurrentDay), moment(today,'yyyy-MM-DD')]);
  const [feeAmountsRadioValue, setFeeAmountsRadioValue] = useState('All Day');
  const [feeAmountsData, setFeeAmountsData] = useState([])


  const columnGroupData = {
    height: 400,
    xField: 'week',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    legend: {
      offsetX: 50,
      position: 'bottom-left',
    },
    meta: {
      value: {
        max: transactionOverviewMax,
        tickCount: 7,
      },
    },
    colorField: 'type',
    color: ['#1890ff', '#2ca02c', '#f5222d'],
    data: transactionOverviewData,
  };

  const configLineFeeChart = {
    height: 320,
    autoFit: true,
    xField: 'xAxis',
    yField: 'value',
    smooth: false,
    meta: {
      value: {
        max: feeLineChartMax,
        tickCount: 10,
      },
    },
    label: true,
    color: '#1890ff',
    data: feeAmountsData,
    point: {},
  };

  const columnDataDeposits = {
    height: 320,
    xField: 'xAxis',
    yField: 'value',
    smooth: true,
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: '#FFFFFF',
      },
    },
    color: '#1890ff',
    meta: {
      value: {
        max: despositColumnChartMax,
        tickCount: 10,
      },
    },
    data: depositAmountsData,
  };

  const columnDataWithdrawals = {
    height: 320,
    xField: 'xAxis',
    yField: 'value',
    smooth: true,
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: '#FFFFFF',
      },
    },
    color: '#1890ff',
    meta: {
      value: {
        max: withdrawalColumnChartMax,
        tickCount: 10,
      },
    },
    data: withdrawalAmountsData,
  };

  const filteredMerchantMerchantLastSevenDays = async ()=> {
    const response = await getMerchantLastSevenDays();

    const todayDate = moment(today).format('yyyy-MM-DD')
    const data: any= [];
    response.data.reverse().forEach((value) => {
      data.push({ week: value.dayOfWeek,type: `${t.formatMessage({ id: 'pages.dashboard.withdrawals' })}`, value: value.totalWithdrawalAmount})
      data.push({ week: value.dayOfWeek,type: `${t.formatMessage({ id: 'pages.dashboard.deposits' })}`, value: value.totalDepositAmount})
      data.push({ week: value.dayOfWeek,type: `${t.formatMessage({ id: 'pages.dashboard.fees' })}`, value: value.totalDepositFee})
    });
    const todayTotalValue = response.data.filter((value)=> value.updatedTime === todayDate);

    const filteredToday = {
      totalWithdrawalAmount: todayTotalValue[0].totalWithdrawalAmount.toFixed(2),
      totalDepositAmount: todayTotalValue[0].totalDepositAmount.toFixed(2),
      totalDepositFee: todayTotalValue[0].totalDepositFee.toFixed(2),
      visitorNumberToday: todayTotalValue[0].visitorNumberToday,
    }
    const max = Math.ceil(response.data.reduce((acc: number, shot: any) => acc = acc > shot.totalWithdrawalAmount ? acc : shot.totalWithdrawalAmount, 0));

    setTransactionOverviewMax(max);
    setTodayValue(filteredToday);
    setTransactionOverviewData(data);
    return response;
  }

  const filteredMerchantWithdrawalStatusPercentage = async (value: RangePickerValue)=> {
    const filter: any = {
      statusList : ["Completed", "Cancelled", "Under Review"],
    };
    const [fromDate, toDate] = value;
    filter.fromDate = moment(fromDate._d).format('yyyy-MM-DD');
    filter.toDate = moment(toDate._d).format('yyyy-MM-DD');

    const response = await fetchMerchantWithdrawalStatusPercentage(filter);
    const statusPercentageMap = response.data.reduce((acc, docSnapshot) => {
      const { status, percentage } = docSnapshot;
      acc[status.replace(/ /g, "").toLowerCase()] = (percentage/100);
      return acc;
    }, {});
    setWithdrawalStatusPercentage(statusPercentageMap);
  }

  const handleWithdrawalStatusPercentageChange = (value: RangePickerValue) => {
    setRangePickerValue(value);
    filteredMerchantWithdrawalStatusPercentage(value);
  };

  //Merchant
  const filteredMerchantFinanceByMerchant = async ()=> {
    const response = await merchantFinanceByMerchant();

    const filteredMerchant = {
      balance: response.data.balance?.toFixed(2),
      totalWithdrawalAmount: response.data.totalWithdrawalAmount?.toFixed(2),
      totalDepositAmount: response.data.totalDepositAmount?.toFixed(2),
      totalDepositFees: response.data.totalDepositFees?.toFixed(2),
      totalWithdrawalTimes: response.data.totalWithdrawalTimes,
      totalDepositTimes: response.data.totalDepositTimes,
    }
    setTodayMerchantValue(filteredMerchant);
    return response;
  }

  const filteredMerchantAmounts = async (value: RangePickerValue, transactionType: string, radioValue?: string) => {
      const filter: any = {
        dateRange : radioValue || withdrawalAmountsRadioValue,
        transactionType
      };
      const [fromDate, toDate] = value;
      filter.fromDate = moment(fromDate._d).format('yyyy-MM-DD');
      filter.toDate = moment(toDate._d).format('yyyy-MM-DD');
     
      const response = await fetchMerchantAmounts(filter);

      const data: any= [];
      response.data.forEach((val) => {
        if(val.dateRange.includes(" ")){
          const dateRangeSplit = val.dateRange.split(" ");
          data.push({ xAxis: `${dateRangeSplit[0]}\n${dateRangeSplit[1]}`, value: val.totalAmount})
        } else {
          data.push({ xAxis: val.dateRange, value: val.totalAmount})
        }
      });

      const max = Math.ceil(data.reduce((acc: number, shot: any) => acc = acc > shot.value ? acc : shot.value, 0));

      if(transactionType === transactionTypes.Withdrawal) {
        setWithdrawalAmountsData(data.reverse());
        setWithdrawalColumnChartMax(max);
      } else if (transactionType === transactionTypes.Deposit) {
        setDepositAmountsData(data.reverse());
        setDespositColumnChartMax(max);
      } else if (transactionType === transactionTypes.Fee) {
        setFeeAmountsData(data.reverse());
        setFeeLineChartMax(max);
      }
  }

  function withdrawalAmountOnChange(e: any) {
    const value = e.target.value;
    setWithdrawalAmountsRadioValue(value);
    filteredMerchantAmounts(withdrawalAmountsRangePickerValue, transactionTypes.Withdrawal, value);
  }

  function depositAmountsOnChange(e: any) {
    const value = e.target.value;
    setDespositAmountsRadioValue(value);
    filteredMerchantAmounts(depositAmountsRangePickerValue, transactionTypes.Deposit, value);
  }

  function feeAmountsOnChange(e: any) {
    const value = e.target.value;
    setFeeAmountsRadioValue(value);
    filteredMerchantAmounts(depositAmountsRangePickerValue, transactionTypes.Fee, value);
  }

  const handleMerchantWithdrawalAmountsChange = (value: RangePickerValue) => {
    setWithdrawalAmountsRangePickerValue(value);
    filteredMerchantAmounts(value, transactionTypes.Withdrawal);
  }

  const handleMerchantDepositAmountsChange = (value: RangePickerValue) => {
    setDepositAmountsRangePickerValue(value);
    filteredMerchantAmounts(value, transactionTypes.Deposit);
  }

  const handleMerchantFeeAmountsChange = (value: RangePickerValue) => {
    setFeeAmountsRangePickerValue(value);
    filteredMerchantAmounts(value, transactionTypes.Fee);
  }


  useEffect(()=>{

    if((currentUser && currentUser.userType === USER_TYPE.Admin) || (currentUser && currentUser.userType === USER_TYPE.Non_Admin && currentUser.parentMerchantType === null)){
      filteredMerchantMerchantLastSevenDays();
      filteredMerchantWithdrawalStatusPercentage([moment(today,'yyyy-MM-DD'), moment(today,'yyyy-MM-DD')]);
    }
    else {
      filteredMerchantFinanceByMerchant();
      filteredMerchantAmounts([moment(lastWeekOfCurrentDay), moment(today,'yyyy-MM-DD')], transactionTypes.Withdrawal)
      filteredMerchantAmounts([moment(lastWeekOfCurrentDay), moment(today,'yyyy-MM-DD')], transactionTypes.Deposit)
      filteredMerchantAmounts([moment(currentWeekOfCurrentDay), moment(today,'yyyy-MM-DD')], transactionTypes.Fee)
    }
  
   },[])

    return (
      <Access 
      accessible={access?.Dashboard.Merchant}
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
          <NotificationMsgBox />
          {((currentUser && currentUser.userType === USER_TYPE.Admin) || (currentUser && currentUser.userType === USER_TYPE.Non_Admin && currentUser.parentMerchantType === null)) ? (
            <GridContent style={{ marginBottom: '2rem' }}>
              <Card>
                <Suspense fallback={<PageLoading />}>
                  <MemberIntroductRow todayValue={todayValue} isMerchant={true}/>
                </Suspense>
                <Row gutter={50}>
                  <Col xl={15} lg={24} md={24} sm={24} xs={24}>
                    <div className={styles.overviewTitle}>
                    <p>{t.formatMessage({ id: 'pages.dashboard.transactionOverview' })}</p>
                    </div>
                    <Column {...columnGroupData} />
                  </Col>
                  <Col xl={9} lg={24} md={24} sm={24} xs={24}>
                    <Row justify={'space-between'} style={{ alignItems: 'baseline' }}>
                      <div>
                      <p>{t.formatMessage({ id: 'pages.dashboard.todayWithdrawals' })}</p>
                      </div>
                      <RangePicker value={rangePickerValue} onChange={handleWithdrawalStatusPercentageChange} defaultValue={[moment(new Date(),'yyyy-MM-DD'), moment(new Date(),'yyyy-MM-DD')]}/>
                    </Row>
                    <Suspense fallback={<PageLoading />}>
                      <WithdrawalStatus withdrawalStatusPercentage={withdrawalStatusPercentage} />
                    </Suspense>
                  </Col>
                </Row>
              </Card>
            </GridContent>
        )
        :
        (
           <GridContent>
           <Card style={{ width: '100%' }}>
             <Suspense fallback={<PageLoading />}>
               <MerchantIntroduceRow todayMerchantValue={todayMerchantValue}/>
             </Suspense>
             <Row gutter={24}>
               <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                 <Tabs defaultActiveKey="1" className={styles.lineChartTabs}>
                   <TabPane tab={t.formatMessage({ id: 'pages.dashboard.fees' })} key="1">
                     <div>
                       <Row style={{ justifyContent: 'space-around', marginBottom: '20px' }}>
                       <Radio.Group className={styles.merchantRadioButton} onChange={feeAmountsOnChange} value={feeAmountsRadioValue} defaultValue="All Day" key="radioButtonGroup" style={{ border: "none" }}>
                         <Radio.Button value="All Day">{t.formatMessage({ id: 'pages.dashboard.allDay' })}</Radio.Button>
                         <Radio.Button value="All Week">{t.formatMessage({ id: 'pages.dashboard.allWeek' })}</Radio.Button>
                         <Radio.Button value="All Month">{t.formatMessage({ id: 'pages.dashboard.allMonth' })}</Radio.Button>
                       </Radio.Group>
                         <RangePicker value={feeAmountsRangePickerValue} onChange={handleMerchantFeeAmountsChange} defaultValue={[moment(currentWeekOfCurrentDay
                          ), moment(today,'yyyy-MM-DD')]}/>
                       </Row>
                       <Line {...configLineFeeChart} />
                     </div>
                   </TabPane>
                 </Tabs>
               </Col>
               <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                 <Tabs defaultActiveKey="1" className={styles.lineChartTabs}>
                   <TabPane tab={t.formatMessage({ id: 'pages.dashboard.deposits' })} key="1">
                     <div>
                       <Row style={{ justifyContent: 'space-around', marginBottom: '20px' }}>
                       <Radio.Group className={styles.merchantRadioButton} onChange={depositAmountsOnChange} value={despositAmountsRadioValue} defaultValue="All Day" key="radioButtonGroup" style={{ border: "none" }}>
                         <Radio.Button value="All Day">{t.formatMessage({ id: 'pages.dashboard.allDay' })}</Radio.Button>
                         <Radio.Button value="All Week">{t.formatMessage({ id: 'pages.dashboard.allWeek' })}</Radio.Button>
                         <Radio.Button value="All Month">{t.formatMessage({ id: 'pages.dashboard.allMonth' })}</Radio.Button>
                       </Radio.Group>
                         <RangePicker value={depositAmountsRangePickerValue} onChange={handleMerchantDepositAmountsChange} defaultValue={[moment(lastWeekOfCurrentDay), moment(today,'yyyy-MM-DD')]}/>
                       </Row>
                       <Column {...columnDataDeposits} />
                     </div>
                   </TabPane>
                   <TabPane tab={t.formatMessage({ id: 'pages.dashboard.withdrawals' })} key="2">
                     <div>
                       <Row style={{ justifyContent: 'space-around', marginBottom: '20px' }}>
                       <Radio.Group className={styles.merchantRadioButton} onChange={withdrawalAmountOnChange} value={withdrawalAmountsRadioValue} defaultValue="All Day" key="radioButtonGroup" style={{ border: "none" }}>
                         <Radio.Button value="All Day">{t.formatMessage({ id: 'pages.dashboard.allDay' })}</Radio.Button>
                         <Radio.Button value="All Week">{t.formatMessage({ id: 'pages.dashboard.allWeek' })}</Radio.Button>
                         <Radio.Button value="All Month">{t.formatMessage({ id: 'pages.dashboard.allMonth' })}</Radio.Button>
                       </Radio.Group>
                       <RangePicker value={withdrawalAmountsRangePickerValue} onChange={handleMerchantWithdrawalAmountsChange} defaultValue={[moment(lastWeekOfCurrentDay), moment(today,'yyyy-MM-DD')]}/>
                       </Row>
                       <Column {...columnDataWithdrawals} />
                     </div>
                   </TabPane>
                 </Tabs>
               </Col>
             </Row>
           </Card>
         </GridContent>
         )}
        </PageContainer>
      </Access>
    )
}
export default Merchant;