import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks/useAppSelector';
import { getCloudinaryUrl } from '../util/cloudinary';
import { IProviderForChatListPage } from '../util/interface/IProvider';
import { providerService } from '../services/providerService';

const createJoiningId = (id1: string, id2: string): string => {
  if (!id1 || !id2) return '';
  return [id1, id2].sort().join('-');
};

const ChatSidebar: React.FC = () => {
  const [providers, setProviders] = useState<IProviderForChatListPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const currentProvider = useAppSelector((state) => state.provider.provider);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await providerService.getProviderForChatPage();
        setProviders(response);
      } catch (error) {
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : filteredProviders.length === 0 ? (
          <p className="p-4 text-gray-500">No chats found.</p>
        ) : (
          filteredProviders.map((chatPartner) => {
            const id1 = user?.id;
            const id2 = chatPartner.id;
            const joiningId = createJoiningId(id1!, id2!);

            return (
              <NavLink
                key={chatPartner.id}
                to={`/chat/${joiningId}`}
                state={{ name: chatPartner.name }}
                className={({ isActive }) =>
                  `flex items-center p-3 space-x-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    isActive ? 'bg-blue-100 dark:bg-blue-900/50' : ''
                  }`
                }
              >
                <img
                  src={getCloudinaryUrl(chatPartner.profilePicture)}
                  alt={chatPartner.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {chatPartner.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {chatPartner.lastMessageAt
                        ? new Date(chatPartner.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {chatPartner.lastMessage || 'No messages yet'}
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
