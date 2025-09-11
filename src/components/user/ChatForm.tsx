import { ChatMessage } from './ChatMessage';

export interface ChatFormProps {
    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    generateBotResponse: (history: ChatMessage[]) => Promise<void>;
}

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

const ChatForm: React.FC<ChatFormProps> = ({ 
    chatHistory, 
    setChatHistory, 
    generateBotResponse 
}) => {
    const [inputValue, setInputValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = useCallback(async (): Promise<void> => {
        const userMessage: string = inputValue.trim();
        if (!userMessage || isLoading) return;
        
        setInputValue("");
        setIsLoading(true);

        const newUserMessage = {
            role: 'user' as const,
            text: userMessage,
            timestamp: new Date(),
            id: Date.now().toString()
        };

        setChatHistory((history) => [...history, newUserMessage]);

        try {
            setTimeout(async () => {
                setChatHistory((history) => [
                    ...history, 
                    { 
                        role: 'model' as const, 
                        text: "Thinking...", 
                        timestamp: new Date(),
                        id: `thinking-${Date.now()}`
                    }
                ]);
                
                await generateBotResponse([
                    ...chatHistory, 
                    { 
                        ...newUserMessage,
                        text: `Using the details provided above, please address this query: ${userMessage}` 
                    }
                ]);
                setIsLoading(false);
            }, 100);
        } catch (error) {
            console.error('Error generating response:', error);
            setIsLoading(false);
        }
    }, [inputValue, isLoading, chatHistory, setChatHistory, generateBotResponse]);

    const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        setInputValue(e.target.value);
    }, []);

    return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all duration-200">
            <input
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
                maxLength={1000}
                aria-label="Chat message input"
            />
            <button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:dark:from-gray-600 disabled:dark:to-gray-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label={isLoading ? "Sending message" : "Send message"}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};

export default ChatForm;