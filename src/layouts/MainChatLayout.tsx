import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import IncomingCallModal from '../components/IncomingCallModal';
import Header from '../components/user/Header'; // Assuming Header is in the same folder structure

const MainChatLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header is added here */}
      <Header />
      
      <div className="flex flex-grow overflow-hidden pt-20"> {/* Added pt-20 to account for fixed header */}
        <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ChatSidebar />
        </div>

        <div className="flex-grow h-full overflow-hidden">
          <Outlet /> 
        </div>
      </div>

      <IncomingCallModal />
    </div>
  );
};

export default MainChatLayout;