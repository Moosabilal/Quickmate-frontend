import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import IncomingCallModal from '../components/IncomingCallModal';

const MainChatLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ChatSidebar />
      </div>

      <div className="flex-grow">
        <Outlet /> 
      </div>

      <IncomingCallModal />
    </div>
  );
};

export default MainChatLayout;