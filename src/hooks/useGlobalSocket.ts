import { useEffect } from 'react';
import { socket } from '../util/socket';
import { useCallStore } from '../app/callStore';
import { useAppSelector } from './useAppSelector';

export function useGlobalSocket() {
  const { setIncomingCall } = useCallStore();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) return;

    const handleIncomingOffer = (payload: {
      joiningId: string;
      offer: RTCSessionDescriptionInit;
      fromUserId: string;
      fromUserName?: string;
    }) => {
      if (window.location.pathname.endsWith('/call')) return;

      const blockKey = `offerBlockUntil:${payload.joiningId}`;
      const blockUntil = Number(localStorage.getItem(blockKey) || 0);
      if (Date.now() < blockUntil) return;

      if (payload.fromUserId === user.id) return;

      setIncomingCall(payload);
    };

    const handleCallRejected = (payload: {
      joiningId: string;
      fromUserId: string;
      toUserId: string;
    }) => {
      if (payload.toUserId === user.id) {
        setIncomingCall(null);
        const blockKey = `offerBlockUntil:${payload.joiningId}`;
        localStorage.setItem(blockKey, String(Date.now() + 7000));
      }
    };

    const handleCallHangup = (payload: {
      joiningId: string;
      fromUserId: string;
    }) => {
      setIncomingCall(null);
      const blockKey = `offerBlockUntil:${payload.joiningId}`;
      localStorage.setItem(blockKey, String(Date.now() + 5000));
    };

    socket.on('webrtc:offer', handleIncomingOffer);
    socket.on('webrtc:call-rejected', handleCallRejected);
    socket.on('webrtc:hangup', handleCallHangup);

    return () => {
      socket.off('webrtc:offer', handleIncomingOffer);
      socket.off('webrtc:call-rejected', handleCallRejected);
      socket.off('webrtc:hangup', handleCallHangup);
    };
  }, [user?.id, setIncomingCall]);
}
