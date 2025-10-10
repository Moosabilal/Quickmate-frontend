import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallStore } from '../app/callStore';
import { socket } from '../util/socket';
import { useAppSelector } from '../hooks/useAppSelector';
import { Phone, PhoneOff } from 'lucide-react';

const IncomingCallModal: React.FC = () => {
  const { incomingCall, setIncomingCall } = useCallStore();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const blockedUntil = incomingCall ? Number(localStorage.getItem(`offerBlockUntil:${incomingCall.joiningId}`) || 0) : 0;
  const isBlocked = Date.now() < blockedUntil;

  if (!incomingCall || location.pathname.endsWith('/call') || isBlocked) {
    return null;
  }

  const handleAccept = () => {
    navigate(`/chat/${incomingCall.joiningId}/call`, {
      state: { 
        name: incomingCall.fromUserName,
        incomingCall: incomingCall 
      },
    });
  };

  const handleDecline = () => {
    socket.emit('webrtc:call-rejected', {
      joiningId: incomingCall.joiningId,
      fromUserId: user?.id,
      toUserId: incomingCall.fromUserId,
    });
    localStorage.setItem(`offerBlockUntil:${incomingCall.joiningId}`, String(Date.now() + 7000));
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h3 className="text-xl font-semibold mb-2">Incoming Call</h3>
        <p className="mb-6">
          {incomingCall.fromUserName || 'Someone'} is calling you...
        </p>
        <div className="flex justify-center space-x-6">
          <button
            onClick={handleDecline}
            className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            <PhoneOff />
          </button>
          <button
            onClick={handleAccept}
            className="p-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            <Phone />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
