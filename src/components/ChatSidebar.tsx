import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks/useAppSelector';
import { IProviderForChatListPage } from '../util/interface/IProvider';
import { providerService } from '../services/providerService';
import { socket } from '../util/socket';
import { useDebounce } from '../hooks/useDebounce';

const createJoiningId = (id1: string, id2: string): string => {
  if (!id1 || !id2) return '';
  return [id1, id2].sort().join('-');
};

const formatLastMessage = (
  msg: IProviderForChatListPage, 
  currentUserId: string
): string => {
  if (!msg.lastMessageAt) {
    return "No messages yet";
  }

  const isMe = msg.lastMessageSenderId === currentUserId;

  switch (msg.messageType) {
    case 'text':
      return isMe ? `You: ${msg.lastMessage}` : (msg.lastMessage || "");
    case 'image':
      return isMe ? "You: 📷 Sent an image" : "📷 Received an image";
    case 'file':
      return isMe ? "You: 📎 Sent a file" : "📎 Received a file";
    default:
      return "No messages yet";
  }
};

const ChatSidebar: React.FC = () => {
  const [providers, setProviders] = useState<IProviderForChatListPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await providerService.getProviderForChatPage(debouncedSearchTerm);
        setProviders(response);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to load chats');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();

    const handleNewMessage = (newMessage: {
      joiningId: string;
      senderId: string;
      text: string;
      messageType: 'text' | 'image' | 'file';
      createdAt: string;
    }) => {
      setProviders(currentProviders => {
        const myId = user.id;
        let partnerId: string;

        if (newMessage.senderId === myId) {
          partnerId = newMessage.joiningId.split('-').find(id => id !== myId)!;
        } else {
          partnerId = newMessage.senderId;
        }

        if (!partnerId) return currentProviders;

        const partnerIndex = currentProviders.findIndex(p => p.id === partnerId);

        if (partnerIndex === -1) return currentProviders;

        const updatedPartner = {
          ...currentProviders[partnerIndex],
          lastMessage: newMessage.text,
          messageType: newMessage.messageType, 
          lastMessageSenderId: newMessage.senderId,
          lastMessageAt: new Date(newMessage.createdAt)
        };

        const newProvidersList = currentProviders.filter(p => p.id !== partnerId);

        return [updatedPartner, ...newProvidersList];
      });
    };

    socket.on('receiveBookingMessage', handleNewMessage);

    return () => {
      socket.off('receiveBookingMessage', handleNewMessage);
    };

  }, [user?.id, debouncedSearchTerm]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-24">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations found.</p>
          </div>
        ) : (
          providers.map((chatPartner) => {
            if (!user?.id) return null;
            const joiningId = createJoiningId(user.id, chatPartner.id);

            return (
              <NavLink
                key={chatPartner.id}
                to={`/chat/${joiningId}`}
                state={{ name: chatPartner.name }}
                className={({ isActive }) =>
                  `flex items-center p-4 space-x-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400' 
                      : 'border-l-4 border-l-transparent'
                  }`
                }
              >
                <div className="relative flex-shrink-0">
                    <img
                    src={chatPartner.profilePicture ? chatPartner.profilePicture : '/profileImage.png'}
                    alt={chatPartner.name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-600 border border-gray-200 dark:border-gray-600"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">
                      {chatPartner.name}
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                      {chatPartner.lastMessageAt
                        ? new Date(chatPartner.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {formatLastMessage(chatPartner, user.id)}
                  </p>
                </div>
              </NavLink>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;