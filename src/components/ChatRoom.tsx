import React from 'react';
import { Video, ArrowLeft, User } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BookingChatVideo from './BookingChatVideo'; 
import { useAppSelector } from '../hooks/useAppSelector';

const ChatRoom: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { joiningId } = useParams<{ joiningId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { name } = (location.state as { name: string }) || { name: 'Chat' };

  console.log('we are in chat room component', name);

  const handleStartVideoCall = () => {
    navigate(`/chat/${joiningId}/call`, { state: { name, isInitiator: true } });
  };

  if (!joiningId) {
    return <div className="flex items-center justify-center h-full text-gray-500">Invalid Chat</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] dark:bg-gray-900 relative">
      <header className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm z-10 flex-shrink-0">
        <button 
          type="button"
          onClick={() => navigate('/chat')} 
          className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>

        <div className="flex-grow min-w-0 cursor-pointer">
          <h1 className="font-semibold text-base md:text-lg truncate">{name}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Tap here for contact info</p>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <button 
            type="button"
            aria-label="Start video call"
            onClick={handleStartVideoCall} 
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
          >
            <Video className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      <div className="flex-grow overflow-hidden relative">
        <div 
            className="absolute inset-0 z-0 opacity-100 dark:opacity-5"
            style={{ 
                backgroundImage: "url('https://i.redd.it/qwd83nc4xxf41.jpg')",
                backgroundRepeat: 'repeat',
                backgroundSize: '400px' 
            }}
        ></div>
        
        <div className="absolute inset-0 z-0 bg-transparent dark:bg-gray-900/90 pointer-events-none"></div>

        <div className="relative z-10 h-full">
            <BookingChatVideo 
            currentUserId={user?.id || ''} 
            joiningId={joiningId}
            mode="chat" 
            name={name}
            />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;