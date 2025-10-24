import React, { lazy } from 'react';

const MainChatLayout = lazy(() => import('../layouts/MainChatLayout'));
const ChatPlaceholder = lazy(() => import('../components/ChatPlaceholder'));
const VideoCallPage = lazy(() => import('../components/VideoCallPage'));
const Chat_Room = lazy(() => import('../components/ChatRoom'));

const commonRoutes = [
  {
    path: '/chat',
    element: <MainChatLayout />,
    children: [
      { index: true, element: <ChatPlaceholder /> },
      { path: ':joiningId', element: <Chat_Room /> },
      
    ],
  },
  { path: '/chat/:joiningId/call', element: <VideoCallPage /> },
];

export default commonRoutes;