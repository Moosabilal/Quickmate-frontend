import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BookingChatVideo from './BookingChatVideo'; 
import { useAppSelector } from '../hooks/useAppSelector';
import { useCallStore } from '../app/callStore';

const VideoCallPage: React.FC = () => {
  const { joiningId } = useParams<{ joiningId: string }>();
  const { user } = useAppSelector(state => state.auth);
  const location = useLocation();

    const { setIncomingCall } = useCallStore();

      const { name, incomingCall, isInitiator } = (location.state as { 
    name: string; 
    incomingCall?: {
      joiningId: string;
      offer: RTCSessionDescription;
      fromUserId: string;
      fromUserName?: string;
    },
    isInitiator?: boolean
  }) || { name: 'Video Call' };

  console.log('VideoCallPage state:',  name );

      useEffect(() => {
    if (incomingCall) {
      setIncomingCall(incomingCall);
    }
  }, [incomingCall, setIncomingCall]);




  if (!joiningId) {
    return <div>Error: Invalid call session.</div>;
  }



  return (
    <div className="h-screen w-screen">
      <BookingChatVideo 
        currentUserId={user?.id || ''}
        joiningId={joiningId}
        mode="video" 
        name={name}
        incomingCall={incomingCall}
        isInitiator={!!isInitiator}
      />
    </div>
  );
};

export default VideoCallPage;
