import React from 'react';
import { Video, ArrowLeft, User } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import BookingChatVideo from './BookingChatVideo'; 

const ChatRoom: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { joiningId } = useParams<{ joiningId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { name } = (location.state as { name: string }) || { name: 'Chat' };

  const handleStartVideoCall = () => {
    navigate(`/chat/${joiningId}/call`, { state: { name, isInitiator: true } });
  };

  if (!joiningId) {
    return <div>Invalid Chat</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5]">
      <header className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm z-10 flex-shrink-0 border-b dark:border-gray-700">
        <button 
          onClick={() => navigate('/chat')} 
          className="mr-4 lg:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
          <User className="w-6 h-6 text-gray-600" />
        </div>

        <div className="flex-grow">
          <h1 className="font-semibold text-lg">{name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleStartVideoCall} 
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Video className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      <div 
        className="flex-grow overflow-hidden" 
        style={{ backgroundImage: "url('https://i.redd.it/qwd83nc4xxf41.jpg')" }}
      >
        <BookingChatVideo 
          currentUserId={user?.id!} 
          joiningId={joiningId}
          mode="chat" 
          name={name}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
