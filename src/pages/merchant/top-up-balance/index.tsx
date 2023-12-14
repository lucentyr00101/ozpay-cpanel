import type { FC} from 'react';
import TopUp from '@/components/Merchant/TopUp';
import { Access, useAccess, useIntl } from 'umi';
import { Result } from 'antd';

const TopUpBalance: FC = () => {
  const t = useIntl();
  const access: any = useAccess();

  // const [pageAccess, setPageAccess] = useState<boolean>(false);

  // useEffect(() => {
  //   const currMenuAccess = access?.Merchants['Top-UpBalance'];
  //   const topUpBalance = Object.keys(currMenuAccess).filter((key)=>{
  //     return currMenuAccess[key] === true;
  //    })
  //    setPageAccess(topUpBalance.length > 0); 
  // }, [])
  
  return (
    <Access
      accessible={access?.Merchants['Top-UpBalance']}
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
      <TopUp />
    </Access>
  );
};

export default TopUpBalance;
