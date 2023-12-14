// /* eslint-disable react/no-unescaped-entities */
// /* eslint-disable react/jsx-no-undef */
// import { Card, Col, DatePicker, Radio, Row, Tabs } from 'antd';
// import type { FC } from 'react';
// import { useState, useEffect } from 'react';
// import { Suspense } from 'react';
// import { GridContent } from '@ant-design/pro-layout';
// import { Column, Line } from '@ant-design/plots';
// import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';

// import { fetchWithdrawalStatusPercentage, getMerchantLastSevenDays, fetchMerchantAmounts, merchantFinanceByMerchant } from './service';

// // import { getTimeDistance } from './utils/utils';

// import PageLoading from './components/PageLoading';
// import MemberIntroductRow from './components/MemberIntroductRow';
// import MerchantIntroduceRow from './components/MerchantIntroductRow';
// import WithdrawalStatus from './components/WithdrawalStatus';

// import styles from './style.less';
// import { useModel, useIntl } from 'umi';
// import moment from 'moment';

// const { RangePicker } = DatePicker;
// const { TabPane } = Tabs;

// type RangePickerValue = RangePickerProps<moment.Moment>['value'];

// // type TimeType = 'today' | 'week' | 'month' | 'year';

// const transactionTypes = {
//   Withdrawal:      'Withdrawal',
//   Deposit:      'Deposit',
//   Fee:      'Fee',
// }

// const Dashboard: FC = () => {
//   const { initialState } = useModel('@@initialState');
//   const { currentUser } = initialState || {};
//   const t = useIntl();
//   const firstDayOfCurrentYear = new Date(new Date().getFullYear(), 0, 1);
//   const today = new Date();
//   const roles = currentUser?.grantedRoles.map((value)=> value.name);

//   //admin
//   const [rangePickerValue, setRangePickerValue] = useState<RangePickerValue>();
//   const [withdrawalStatusPercentage, setWithdrawalStatusPercentage] = useState({});
//   const [todayValue, setTodayValue] = useState({});
//   const [transactionOverviewData, setTransactionOverviewData] = useState([]);

//   //merchant
//   const [todayMerchantValue, setTodayMerchantValue] = useState({});
//   const [withdrawalAmountsRangePickerValue, setWithdrawalAmountsRangePickerValue] = useState<RangePickerValue>([moment(firstDayOfCurrentYear), moment(today, 'yyyy-MM-DD')]);
//   const [withdrawalAmountsRadioValue, setWithdrawalAmountsRadioValue] = useState('All Day');
//   const [withdrawalAmountsData, setWithdrawalAmountsData] = useState([]);

//   const [depositAmountsRangePickerValue, setDepositAmountsRangePickerValue] = useState<RangePickerValue>([moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')]);
//   const [despositAmountsRadioValue, setDespositAmountsRadioValue] = useState('All Day');
//   const [depositAmountsData, setDepositAmountsData] = useState([]);

//   const [feeAmountsRangePickerValue, setFeeAmountsRangePickerValue] = useState<RangePickerValue>([moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')]);
//   const [feeAmountsRadioValue, setFeeAmountsRadioValue] = useState('All Day');
//   const [feeAmountsData, setFeeAmountsData] = useState([])

//   const filteredWithdrawalStatusPercentage = async (value: RangePickerValue)=> {
//     const filter: any = {
//       statusList : ["Completed", "Cancelled", "Under Review"],
//     };
//     const [fromDate, toDate] = value;
//     filter.fromDate = moment(fromDate._d).format('yyyy-MM-DD');
//     filter.toDate = moment(toDate._d).format('yyyy-MM-DD');

//     const response = await fetchWithdrawalStatusPercentage(filter);
//     const statusPercentageMap = response.data.reduce((acc, docSnapshot) => {
//       const { status, percentage } = docSnapshot;
//       acc[status.replace(/ /g, "").toLowerCase()] = (percentage/100);
//       return acc;
//     }, {});
//     setWithdrawalStatusPercentage(statusPercentageMap);
//   }

//   const filteredMerchantLastSevenDays = async ()=> {
//     const response = await getMerchantLastSevenDays();
//     const todayDate = moment(today).format('yyyy-MM-DD')
//     const data: any= [];
//     response.data.forEach((value) => {
//       data.push({ week: value.dayOfWeek,type: `${t.formatMessage({ id: 'pages.dashboard.withdrawals' })}`, value: value.totalWithdrawalAmount})
//       data.push({ week: value.dayOfWeek,type: `${t.formatMessage({ id: 'pages.dashboard.deposits' })}`, value: value.totalDepositAmount})
//       data.push({ week: value.dayOfWeek,type: `${t.formatMessage({ id: 'pages.dashboard.fees' })}`, value: value.totalDepositFee})
//     });
//     const todayTotalValue = response.data.filter((value)=> value.updatedTime === todayDate);

//     const filteredToday = {
//       totalWithdrawalAmount: todayTotalValue[0].totalDepositAmount.toFixed(2),
//       totalDepositAmount: todayTotalValue[0].totalDepositAmount.toFixed(2),
//       totalDepositFee: todayTotalValue[0].totalDepositFee.toFixed(2),
//       visitorNumberToday: todayTotalValue[0].visitorNumberToday,
//     }

//     setTodayValue(filteredToday);
//     setTransactionOverviewData(data);
//     return response;
//   }

//   const handleWithdrawalStatusPercentageChange = (value: RangePickerValue) => {
//     setRangePickerValue(value);
//     filteredWithdrawalStatusPercentage(value);
//   };

//   // merchant
//   const filteredMerchantFinanceByMerchant = async ()=> {
//     const merchantId = currentUser?.id || '';
//     const response = await merchantFinanceByMerchant(merchantId);
//     const filteredMerchant = {
//       balance: response.data.balance.toFixed(2),
//       totalWithdrawalAmount: response.data.totalWithdrawalAmount.toFixed(2),
//       totalDepositAmount: response.data.totalDepositAmount.toFixed(2),
//       totalWithdrawalTimes: response.data.totalWithdrawalTimes,
//       totalDepositTimes: response.data.totalDepositTimes,
//     }
//     setTodayMerchantValue(filteredMerchant);
//     return response;
//   }

//   const filteredMerchantAmounts = async (value: RangePickerValue, transactionType: string, radioValue?: string) => {
//       const filter: any = {
//         dateRange : radioValue || withdrawalAmountsRadioValue,
//         transactionType
//       };
//       const [fromDate, toDate] = value;
//       filter.fromDate = moment(fromDate._d).format('yyyy-MM-DD');
//       filter.toDate = moment(toDate._d).format('yyyy-MM-DD');
     
//       const response = await fetchMerchantAmounts(filter);
//       const data: any= [];
//       response.data.forEach((value) => {
//         if(value.dateRange.includes(" ")){
//           const dateRangeSplit = value.dateRange.split(" ");
//           data.push({ xAxis: `${dateRangeSplit[0]}\n${dateRangeSplit[1]}`, value: value.totalAmount})
//         } else {
//           data.push({ xAxis: value.dateRange, value: value.totalAmount})
//         }
       
//       });

//       if(transactionType === transactionTypes.Withdrawal) {
//         setWithdrawalAmountsData(data);
//       } else if (transactionType === transactionTypes.Deposit) {
//         setDepositAmountsData(data);
//       } else if (transactionType === transactionTypes.Fee) {
//         setFeeAmountsData(data);
//       }
//   }

//   function withdrawalAmountOnChange(e: any) {
//     const value = e.target.value;
//     setWithdrawalAmountsRadioValue(value);
//     filteredMerchantAmounts(withdrawalAmountsRangePickerValue, transactionTypes.Withdrawal, value);
//   }

//   function depositAmountsOnChange(e: any) {
//     const value = e.target.value;
//     setDespositAmountsRadioValue(value);
//     filteredMerchantAmounts(depositAmountsRangePickerValue, transactionTypes.Deposit, value);
//   }

//   function feeAmountsOnChange(e: any) {
//     const value = e.target.value;
//     setFeeAmountsRadioValue(value);
//     filteredMerchantAmounts(depositAmountsRangePickerValue, transactionTypes.Fee, value);
//   }

//   const handleMerchantWithdrawalAmountsChange = (value: RangePickerValue) => {
//     setWithdrawalAmountsRangePickerValue(value);
//     filteredMerchantAmounts(value, transactionTypes.Withdrawal);
//   }

//   const handleMerchantDepositAmountsChange = (value: RangePickerValue) => {
//     setDepositAmountsRangePickerValue(value);
//     filteredMerchantAmounts(value, transactionTypes.Deposit);
//   }

//   const handleMerchantFeeAmountsChange = (value: RangePickerValue) => {
//     setFeeAmountsRangePickerValue(value);
//     filteredMerchantAmounts(value, transactionTypes.Fee);
//   }

//   useEffect(()=>{
//    if(roles && roles.includes("Merchant")){
//     filteredMerchantFinanceByMerchant();
//     filteredMerchantAmounts([moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')], transactionTypes.Withdrawal)
//     filteredMerchantAmounts([moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')], transactionTypes.Deposit)
//     filteredMerchantAmounts([moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')], transactionTypes.Fee)
//    } 

//    if(roles && roles.includes("Admin")){
//     filteredMerchantLastSevenDays();
//     filteredWithdrawalStatusPercentage([moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')]);
//    }
//   },[])
  
//   const columnGroupData = {
//     height: 400,
//     xField: 'week',
//     yField: 'value',
//     seriesField: 'type',
//     isGroup: true,
//     legend: {
//       offsetX: 50,
//       position: 'bottom-left',
//     },
//     meta: {
//       value: {
//         max: 1200,
//         tickCount: 7,
//       },
//     },
//     colorField: 'type',
//     color: ['#1890ff', '#2ca02c', '#f5222d'],
//     data: transactionOverviewData,
//   };

//   const columnDataWithdrawals = {
//     height: 320,
//     xField: 'xAxis',
//     yField: 'value',
//     smooth: true,
//     label: {
//       // 可手动配置 label 数据标签位置
//       position: 'middle',
//       // 'top', 'bottom', 'middle',
//       // 配置样式
//       style: {
//         fill: '#FFFFFF',
//       },
//     },
//     color: '#1890ff',
//     meta: {
//       value: {
//         max: 8000,
//         tickCount: 10,
//       },
//     },
//     data: withdrawalAmountsData,
//   };

//   const columnDataDeposits = {
//     height: 320,
//     xField: 'xAxis',
//     yField: 'value',
//     smooth: true,
//     label: {
//       // 可手动配置 label 数据标签位置
//       position: 'middle',
//       // 'top', 'bottom', 'middle',
//       // 配置样式
//       style: {
//         fill: '#FFFFFF',
//       },
//     },
//     color: '#1890ff',
//     meta: {
//       value: {
//         max: 8000,
//         tickCount: 10,
//       },
//     },
//     data: depositAmountsData,
//   };

//   const configLineFeeChart = {
//     height: 320,
//     autoFit: true,
//     xField: 'xAxis',
//     yField: 'value',
//     smooth: false,
//     meta: {
//       value: {
//         max: 7500,
//         tickCount: 10,
//       },
//     },
//     label: true,
//     color: '#1890ff',
//     data: feeAmountsData,
//     point: {},
//   };

//   // const isActive = (type: TimeType) => {
//   //   if (!rangePickerValue) {
//   //     return '';
//   //   }
//   //   const value = getTimeDistance(type);
//   //   if (!value) {
//   //     return '';
//   //   }
//   //   if (!rangePickerValue[0] || !rangePickerValue[1]) {
//   //     return '';
//   //   }
//   //   if (
//   //     rangePickerValue[0].isSame(value[0] as moment.Moment, 'day') &&
//   //     rangePickerValue[1].isSame(value[1] as moment.Moment, 'day')
//   //   ) {
//   //     return styles.currentDate;
//   //   }
//   //   return '';
//   // };

//   return (
//     <>
//       {roles && roles.includes("Admin") && (
//         <GridContent style={{ marginBottom: '2rem' }}>
//           <Card>
//             <Suspense fallback={<PageLoading />}>
//               <MemberIntroductRow todayValue={todayValue}/>
//             </Suspense>
//             <Row gutter={50}>
//               <Col xl={15} lg={24} md={24} sm={24} xs={24}>
//                 <div className={styles.overviewTitle}>
//                 <p>{t.formatMessage({ id: 'pages.dashboard.transactionOverview' })}</p>
//                 </div>
//                 <Column {...columnGroupData} />
//               </Col>
//               <Col xl={9} lg={24} md={24} sm={24} xs={24}>
//                 <Row justify={'space-between'} style={{ alignItems: 'baseline' }}>
//                   <div>
//                   <p>{t.formatMessage({ id: 'pages.dashboard.todayWithdrawals' })}</p>
//                   </div>
//                   <RangePicker value={rangePickerValue} onChange={handleWithdrawalStatusPercentageChange} defaultValue={[moment('2021-01-01'), moment(new Date(),'yyyy-MM-DD')]}/>
//                 </Row>
//                 <Suspense fallback={<PageLoading />}>
//                   <WithdrawalStatus withdrawalStatusPercentage={withdrawalStatusPercentage} />
//                 </Suspense>
//               </Col>
//             </Row>
//           </Card>
//         </GridContent>
//       )}
//       {roles && roles.includes("Merchant") && (
//         <GridContent>
//           <Card style={{ width: '100%' }}>
//             <Suspense fallback={<PageLoading />}>
//               <MerchantIntroduceRow todayMerchantValue={todayMerchantValue}/>
//             </Suspense>
//             <Row gutter={24}>
//               <Col xl={12} lg={24} md={24} sm={24} xs={24}>
//                 <Tabs defaultActiveKey="1" className={styles.lineChartTabs}>
//                   <TabPane tab={t.formatMessage({ id: 'pages.dashboard.fees' })} key="1">
//                     <div>
//                       <Row style={{ justifyContent: 'space-around', marginBottom: '20px' }}>
//                       <Radio.Group className={styles.merchantRadioButton} onChange={feeAmountsOnChange} value={feeAmountsRadioValue} defaultValue="All Day" key="radioButtonGroup" style={{ border: "none" }}>
//                         <Radio.Button value="All Day">{t.formatMessage({ id: 'pages.dashboard.allDay' })}</Radio.Button>
//                         <Radio.Button value="All Week">{t.formatMessage({ id: 'pages.dashboard.allWeek' })}</Radio.Button>
//                         <Radio.Button value="All Month">{t.formatMessage({ id: 'pages.dashboard.allMonth' })}</Radio.Button>
//                       </Radio.Group>
//                         <RangePicker value={feeAmountsRangePickerValue} onChange={handleMerchantFeeAmountsChange} defaultValue={[moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')]}/>
//                       </Row>
//                       <Line {...configLineFeeChart} />
//                     </div>
//                   </TabPane>
//                 </Tabs>
//               </Col>
//               <Col xl={12} lg={24} md={24} sm={24} xs={24}>
//                 <Tabs defaultActiveKey="1" className={styles.lineChartTabs}>
//                   <TabPane tab={t.formatMessage({ id: 'pages.dashboard.deposits' })} key="1">
//                     <div>
//                       <Row style={{ justifyContent: 'space-around', marginBottom: '20px' }}>
//                       <Radio.Group className={styles.merchantRadioButton} onChange={depositAmountsOnChange} value={despositAmountsRadioValue} defaultValue="All Day" key="radioButtonGroup" style={{ border: "none" }}>
//                         <Radio.Button value="All Day">{t.formatMessage({ id: 'pages.dashboard.allDay' })}</Radio.Button>
//                         <Radio.Button value="All Week">{t.formatMessage({ id: 'pages.dashboard.allWeek' })}</Radio.Button>
//                         <Radio.Button value="All Month">{t.formatMessage({ id: 'pages.dashboard.allMonth' })}</Radio.Button>
//                       </Radio.Group>
//                         <RangePicker value={depositAmountsRangePickerValue} onChange={handleMerchantDepositAmountsChange} defaultValue={[moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')]}/>
//                       </Row>
//                       <Column {...columnDataDeposits} />
//                     </div>
//                   </TabPane>
//                   <TabPane tab={t.formatMessage({ id: 'pages.dashboard.withdrawals' })} key="2">
//                     <div>
//                       <Row style={{ justifyContent: 'space-around', marginBottom: '20px' }}>
//                       <Radio.Group className={styles.merchantRadioButton} onChange={withdrawalAmountOnChange} value={withdrawalAmountsRadioValue} defaultValue="All Day" key="radioButtonGroup" style={{ border: "none" }}>
//                         <Radio.Button value="All Day">{t.formatMessage({ id: 'pages.dashboard.allDay' })}</Radio.Button>
//                         <Radio.Button value="All Week">{t.formatMessage({ id: 'pages.dashboard.allWeek' })}</Radio.Button>
//                         <Radio.Button value="All Month">{t.formatMessage({ id: 'pages.dashboard.allMonth' })}</Radio.Button>
//                       </Radio.Group>
//                       <RangePicker value={withdrawalAmountsRangePickerValue} onChange={handleMerchantWithdrawalAmountsChange} defaultValue={[moment(firstDayOfCurrentYear), moment(today,'yyyy-MM-DD')]}/>
//                       </Row>
//                       <Column {...columnDataWithdrawals} />
//                     </div>
//                   </TabPane>
//                 </Tabs>
//               </Col>
//             </Row>
//           </Card>
//         </GridContent>
//       )}
//     </>
//   );
// };

// export default Dashboard;
