export interface ChatMessage {
    hideInChat?: boolean;
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    timestamp?: Date;
    id?: string;
}

export interface ChatMessageProps {
    chat: ChatMessage;
}
import ChatbotIcon from './ChatbotIcon';

import React from 'react';
import { Bot, User } from 'lucide-react';

const ChatMessage: React.FC<ChatMessageProps> = ({ chat }) => {
    if (chat.hideInChat) return null;

    const isBot: boolean = chat.role === "model";
    
    return (
        <div className={`flex gap-3 mb-4 ${isBot ? 'justify-start' : 'justify-end'} animate-fadeInUp`}>
            {isBot && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}
            
            <div className={`max-w-[280px] px-4 py-2 rounded-2xl shadow-sm ${
                isBot 
                    ? `bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-md ${
                        chat.isError ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700' : ''
                    }` 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-md'
            }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                    {chat.text}
                </p>
                {chat.timestamp && (
                    <span className={`text-xs opacity-70 block mt-1 ${
                        isBot ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'
                    }`}>
                        {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            
            {!isBot && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
};

export default ChatMessage;