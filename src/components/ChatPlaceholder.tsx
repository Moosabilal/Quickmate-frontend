import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatPlaceholder: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      <div className="text-center p-8">
        <MessageSquare size={80} className="mx-auto text-gray-300 dark:text-gray-600" />
        <h2 className="mt-6 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Your Messages
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Select a chat from the left sidebar to start a conversation.
        </p>
      </div>
    </div>
  );
};

export default ChatPlaceholder;