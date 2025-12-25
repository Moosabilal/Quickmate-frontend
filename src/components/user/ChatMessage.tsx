import React from 'react';
import { Bot } from 'lucide-react';
import { ChatMessageProps, ChatOption } from '../../util/interface/IChatBot';

const ChatMessage: React.FC<ChatMessageProps & { onOptionClick: (text: string) => void }> = ({ chat, onOptionClick }) => {
    if (chat.hideInChat) {
        return null;
    }

    const isUser = chat.role === 'user';

    const handleOptionClick = (option: ChatOption, index?: number) => {
        if (!option) return;

        if (typeof option === 'object' && option.label && option.street) {
            onOptionClick(`Select option ${index}`);
        } else if (typeof option === 'object' && option.name && option.price) {
            if (chat.options) {
                onOptionClick(`Select option ${chat.options.indexOf(option) + 1}`);
            }
        } else if (typeof option === 'string') {
            onOptionClick(option);
        } else if (option.name) {
            onOptionClick(option.name);
        }
    };

    return (
        <div className={`flex gap-3 mb-4 animate-fadeInUp ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}

            <div className="flex flex-col items-start gap-2 max-w-[80%] sm:max-w-[70%]">
                <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${isUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                        }`}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.text}</p>
                </div>

                {chat.options && chat.options.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {chat.options.map((option, index) => {
                            if (typeof option === 'string') {
                                return (
                                    <button type='button' key={index} onClick={() => handleOptionClick(option)} className="px-3 py-1.5 text-sm bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {option}
                                    </button>
                                );
                            }
                            return (
                                <button type='button' key={option.id || index} onClick={() => handleOptionClick(option, index + 1)} className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {option.label && option.street ? (
                                        <>
                                            <span className="font-semibold">{option.index}. {option.label}</span>
                                            <span className="block text-xs text-gray-600 dark:text-gray-300">{option.street}, {option.city}</span>
                                        </>
                                    ) : option.name && option.price ? (
                                        <>
                                            <span className="font-semibold">{index + 1}. {option.name}</span>
                                            <span className="block text-xs text-gray-600 dark:text-gray-300">Rating: {option.rating} | Price: ₹{option.price}</span>
                                        </>
                                    ) : (
                                        option.name || `Option ${index + 1}`
                                    )}
                                </button>
                            );
                        })}

                        {/* Add "Add New Address" button if options are addresses */}
                        {chat.options[0] &&
                            typeof chat.options[0] !== 'string' &&
                            chat.options[0].label &&
                            chat.options[0].street && (
                                <button
                                    onClick={() => onOptionClick("NAVIGATE_PROFILE_ADDRESS")}
                                    className="w-full text-center px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    + Add New Address
                                </button>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;