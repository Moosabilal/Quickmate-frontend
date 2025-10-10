import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import IncomingCallModal from '../components/IncomingCallModal';

const MainChatLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Pane: Chat List */}
      <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ChatSidebar />
      </div>

      {/* Right Pane: Active Chat Window or Placeholder */}
      <div className="flex-grow">
        <Outlet /> 
      </div>

      {/* Incoming call modal rendered within Router context */}
      <IncomingCallModal />
    </div>
  );
};

export default MainChatLayout;