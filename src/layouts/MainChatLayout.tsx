// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import ChatSidebar from '../components/ChatSidebar';
// import IncomingCallModal from '../components/IncomingCallModal';
// import Header from '../components/user/Header'; 

// const MainChatLayout: React.FC = () => {
//   return (
//     <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
//       <Header />
//       <div className="flex flex-grow overflow-hidden pt-20"> 
//         <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//           <ChatSidebar />
//         </div>

//         <div className="flex-grow h-full overflow-hidden">
//           <Outlet /> 
//         </div>
//       </div>

//       <IncomingCallModal />
//     </div>
//   );
// };

// export default MainChatLayout;



import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import IncomingCallModal from '../components/IncomingCallModal';
import Header from '../components/user/Header';

const MainChatLayout: React.FC = () => {
  const location = useLocation();
  

  const isChatSelected = location.pathname !== '/chat' && location.pathname !== '/chat/';

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <div className="flex flex-grow overflow-hidden pt-20 relative">
        
        <div className={`
          w-full md:w-1/3 lg:w-1/4 xl:w-1/5 h-full
          border-r border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          transition-all duration-300
          ${isChatSelected ? 'hidden md:block' : 'block'}
        `}>
          <ChatSidebar />
        </div>

        <div className={`
          flex-grow h-full overflow-hidden 
          bg-gray-50 dark:bg-gray-900
          ${!isChatSelected ? 'hidden md:block' : 'block'}
        `}>
          <Outlet />
        </div>
      </div>

      <IncomingCallModal />
    </div>
  );
};

export default MainChatLayout;