import React from 'react';
import { Bot } from 'lucide-react';
import { ChatbotIconProps } from '../../util/interface/IChatBot';

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ className = "" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Bot className="w-6 h-6" />
        </div>
    );
};

export default ChatbotIcon;
