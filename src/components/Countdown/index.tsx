import { Typography } from "antd";
import { useState, useEffect } from "react";

interface Countdown {
  target: string;
  day?: boolean;
  hour?: boolean;
  minute?: boolean;
  second?: boolean;
  onRefreshFetchChargeRequests?: () => void;
}
const CountDown = ({ target, day = false, hour = true, minute = true, second = true, onRefreshFetchChargeRequests }: Countdown) => {
    const { Text } = Typography;

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    
    useEffect(() => {
      
        setTimeout(() => {
            const distance = new Date(target).getTime() - new Date().getTime();
            if(distance < 0 && onRefreshFetchChargeRequests){
              onRefreshFetchChargeRequests();
            }
            setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
            setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            setSeconds(Math.floor((distance % (1000 * 60)) / 1000))
        }, 1000);
        
      }, [seconds, target]);

  return (
    <div>
      <Text type="danger" strong style={{ fontSize: 16 }}>
        {day && `${days} : `}  
        {hour && `${hours >=10 ? hours : hours <=0 ? '00':'0'+hours} : `} 
        {minute && `${minutes >= 10 ? minutes : minutes <=0 ? '00' : '0'+minutes} : `} 
        {second && `${ seconds >=10 ? seconds : seconds <=0 ? '00':'0'+seconds}`}</Text>
    </div>
  );
};

export default CountDown;
