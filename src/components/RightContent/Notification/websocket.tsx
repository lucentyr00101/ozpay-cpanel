import type { FC } from 'react';
import { memo } from 'react';
import { useCallback } from 'react';
import { useEffect, useState } from 'react';
// import SockJSClient from 'react-stomp';
// import Cookies from 'universal-cookie';
import { poll, pollSysNotif, pollWithdrawalNotif, pollPrivateMsgs } from './service';
// import type { NotificationItem } from './data.d';
import { useModel, getLocale } from 'umi';
import LogoutPrompt from './components/LogoutPrompt';
import Cookies from 'universal-cookie';
import { useIntl } from 'umi';
import { fetchStatusByDictionaryCode } from '@/pages/system-settings/dictionary/utils/utils';
import { DICTIONARY_TYPE_CODE } from '@/components/enums/dictionary/dictionary.enum';
import useStateRef from 'react-usestateref';

interface Props {
  setNotifications: (values: any) => void;
  setMessages: (values: any) => void;
  logout: () => void;
  messages: any;
  notifications: any;
  setIntervalTimeout: (data: any) => void;
  intervalTimeout: any;
  dropdownVisible: boolean;
}

const NotificationWebsocket: FC<Props> = ({
  setNotifications,
  logout,
  setMessages,
  messages,
  notifications,
  setIntervalTimeout,
  intervalTimeout,
  dropdownVisible,
}) => {
  const t = useIntl();
  const cookies = new Cookies();
  const selectedLang = getLocale();
  const AUTH_TOKEN = cookies.get('auth_token');
  // const SOCKET_URL = 'https://opayant-api.mir708090.com/ws';
  // const TOPICS = ['/user/topic/withdrawal', '/user/topic/sysUser'];
  // const HEADERS = {
  //   Authorization: `Bearer ${AUTH_TOKEN}`,
  // };

  const POLL_INTERVAL = 5000;

  const [message, setMessage] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [, setIntervalEnums, intervalEnumsRef] = useStateRef() as any;
  const [, setAudio, audioRef] = useStateRef(null) as any;
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [, setFirstFetched, firstFetchedRef] = useStateRef(false);

  const { initialState } = useModel('@@initialState');
  const { currentUser }: any = initialState || {};

  const getMessage = (data: any) => {
    switch (true) {
      case data.isDisabled:
      case data.areRolesDisabled:
        return t.formatMessage({ id: 'modal.accDisbale' });
      case data.isResetPassword:
        return t.formatMessage({ id: 'modal.accResetPw' });
      case data.isResetLoginOtp:
        return t.formatMessage({ id: 'modal.accResetOtp' });
      case data.invalidToken:
        return t.formatMessage({ id: 'modal.sessionTimeOut' });
      case data.isIpWhitelisted === false:
        return t.formatMessage({ id: 'modal.accChangeIP' });
      default:
        return '';
    }
  };

  const fetchSysNotif = async () => {
    try {
      await poll({
        fn: async () => {
          try {
            return await pollSysNotif(currentUser?.id);
          } catch (e: any) {
            // const errMsgs = ['Login has expired, please login again', 'Token is not valid'];
            const codes = [200, 201];
            if (!codes.includes(e?.response?.status)) {
              setMessage(getMessage({ invalidToken: true }));
              if (!showLogout) setShowLogout(true);
            }
            return Promise.reject(e);
          }
        },
        validate: (data: any) => !!data,
        interval: POLL_INTERVAL,
        action: (result: any) => {
          const {
            isResetLoginOtp,
            isResetPassword,
            isIpWhitelisted,
            isDisabled,
            areRolesDisabled,
          } = result?.data?.data;
          setMessage(getMessage(result?.data?.data));
          return (
            (isResetLoginOtp ||
              isResetPassword ||
              !isIpWhitelisted ||
              isDisabled ||
              areRolesDisabled) &&
            !showLogout &&
            setShowLogout(true)
          );
        },
      });
    } catch (e: any) {
      // setMessage('');
      // if (!showLogout) setShowLogout(true);
      console.log(e?.data?.message || 'Something went wrong.');
    }
  };

  const fetchWithdrawalNotif = async () => {
    try {
      await poll({
        fn: pollWithdrawalNotif,
        validate: (data: any) => !!data,
        interval: POLL_INTERVAL,
        action: (result: any) => {
          const hasUnreadNotifs = result?.data?.data.some(
            (_notif: any) => _notif.status === 'Under Review',
          );
          const allReviewed = result?.data?.data.every(
            (_notif: any) => _notif.status !== 'Under Review',
          );
          // const underReviewNotifs = result?.data?.data.filter((_notif: any) => _notif.status === 'Under Review')
          const receivedNewNotif = result?.data?.data.some((_notif: any) => {
            if (_notif.status === 'Under Review') {
              const currentData = notifications.current.find(
                (__notif: any) => __notif.id === _notif.id && __notif.status === 'Under Review',
              );
              console.log(!currentData, _notif?.deposits?.length, currentData?.deposits?.length);
              return !currentData || _notif?.deposits?.length > currentData?.deposits?.length;
            }
            return false;
          });
          if (receivedNewNotif) {
            // play sound here
            console.log('new notif');
            console.log({ hasUnreadNotifs });
            setAudioPlaying(true);
          }
          // if (firstFetchedRef && hasUnreadNotifs) {
          //   console.log('first fetched and has unread notifs');
          //   setAudioPlaying(true);
          // }
          if (firstFetchedRef && allReviewed) {
            console.log('no under review notif, stopping sound');
            audioRef.current.removeEventListener('ended', null, false);
            setAudioPlaying(false);
          }
          if (!firstFetchedRef) setFirstFetched(true);
          setNotifications(result?.data?.data);
        },
      });
    } catch (e: any) {
      console.log(e?.data?.message || 'Something went wrong');
    }
  };

  const fetchPrivateMsgs = async () => {
    try {
      await poll({
        fn: pollPrivateMsgs,
        validate: (data: any) => !!data,
        interval: POLL_INTERVAL,
        action: (result: any) => {
          if (messages.current.length < result?.data?.data.length) {
            // play sound here
            const hasUnreadMessages = result?.data?.data.some(
              (_msg: any) => _msg.readMessage === 'No',
            );
            if (hasUnreadMessages) setAudioPlaying(true);
          }
          setMessages([...(result.data?.data || [])]);
        },
      });
    } catch (e: any) {
      console.log(e?.data?.message || 'Something went wrong');
    }
  };

  const fetchNotifInterval = async () => {
    const _intervals = await fetchStatusByDictionaryCode(
      DICTIONARY_TYPE_CODE.Notification_Interval_Code,
      selectedLang,
    );
    setIntervalEnums(_intervals);
  };

  const checkNotificationSound = () => {
    console.log('checkNotificationSound', { audioPlaying });
    if (!audioRef.current) {
      console.error('no sound');
      return;
    }
    audioRef.current.removeEventListener('ended', null, false);
    if (audioPlaying) {
      audioRef.current.addEventListener(
        'ended',
        () => {
          console.log('sound ended');
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        },
        false,
      );
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  };

  const handleNotifInterval = async () => {
    console.log('handlenotifinterval');
    await fetchNotifInterval();
    if (intervalEnumsRef.current) {
      const [interval] = Object.keys(intervalEnumsRef.current)
        .map((a) => +a)
        .sort((a, b) => +a - +b);
      const TIME = 60 * (interval || 10) * 1000;
      console.log({ TIME });
      const _t = setInterval(() => {
        const hasUnreadMessages = messages.current.some((_msg: any) => _msg.readMessage === 'No');
        const hasUnreadNotifs = notifications.current.some(
          (_notif: any) => _notif.status === 'Under Review',
        );
        if (hasUnreadMessages || hasUnreadNotifs) {
          console.log('interval: under review || unread message');
          setAudioPlaying(true);
        } else {
          clearInterval(intervalTimeout.current);
          setIntervalTimeout(undefined);
        }
      }, TIME);
      console.log(`created interval id: ${_t}`);
      setIntervalTimeout(_t);
    }
  };

  const initiate = useCallback(async () => {
    if (AUTH_TOKEN) {
      await Promise.all([
        fetchNotifInterval(),
        fetchSysNotif(),
        fetchWithdrawalNotif(),
        fetchPrivateMsgs(),
      ]);
      handleNotifInterval();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      checkNotificationSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPlaying]);

  useEffect(() => {
    if (dropdownVisible) {
      audioRef.current.removeEventListener('ended', null, false);
      console.log(`clear interval ${intervalTimeout}`);
      console.log(intervalTimeout);
      setAudioPlaying(false);
      clearInterval(intervalTimeout.current);
      setIntervalTimeout(undefined);
      handleNotifInterval();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownVisible]);

  useEffect(() => {
    initiate();
    return () => {
      console.log('audio cleanup');
      if (audioPlaying) {
        setAudioPlaying(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      audioRef.current.pause();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearInterval(intervalTimeout.current);
      setIntervalTimeout(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      setAudio(new Audio('/sounds/so-proud-notification.mp3') as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <LogoutPrompt message={message} visible={showLogout} logout={async () => await logout()} />
      {/* <button onClick={() => testWebsocket()}>Test Websocket</button> */}
      {/* <SockJSClient
        url={SOCKET_URL}
        topics={TOPICS}
        headers={HEADERS}
        onConnect={() => console.log('connected')}
        onDisconnect={() => console.log('disconnected')}
        onMessage={handleNotification}
        debug={false}
      /> */}
    </>
  );
};

export default memo(NotificationWebsocket);
