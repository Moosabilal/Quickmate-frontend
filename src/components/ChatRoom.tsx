import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../util/socket'
import { Send, Video, Phone, MoreVertical, Paperclip, Smile, ArrowLeft, User, Circle, Image, Mic, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { bookingService } from '../services/bookingService';
import BookingChatVideo from './BookingChatVideo';

// interface Message {
//   _id?: string
//   bookingId: string;
//   senderId: string;
//   text: string;
//   timestamp: Date;
//   isCurrentUser?: boolean;
// }

const ChatRoom: React.FC = () => {
  // const [message, setMessage] = useState('');
  // const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = user?.name;

  const { bookingId, name } = location.state as { bookingId: string; name: string };
  


  const formatTime = (dateInput?: Date | string | number) => {
    if (!dateInput) return '';
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateInput?: Date | string | number) => {
    if (!dateInput) return '';
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const today = new Date();
    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (messageDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === todayDate.getTime() - 86400000) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString();
    }
  };

  // useEffect(() => {
  //   const getAllChats = async() => {
  //     try {
  //       const data = await bookingService.getAllPreviousChat(bookingId)
  //     const formatted = data.map((msg: any) => ({
  //       bookingId: String(msg.bookingId),
  //       senderId: String(msg.senderId),
  //       text: String(msg.text),
  //       timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  //       isCurrentUser: String(msg.senderId) === String(currentUserId),
  //     }));
  //     setMessages(formatted);
  //     } catch (error) {
        
  //     }
  //   }
  //   getAllChats()
  // }, [bookingId])


  
  // useEffect(() => {
  //   if (!bookingId) return;

  //   socket.emit('joinBookingRoom', bookingId);

  //   const handler = (msg: any) => {
  //     try {
  //       const parsed: Message = {
  //         bookingId: String(msg.bookingId || bookingId),
  //         senderId: String(msg.senderId || 'unknown'),
  //         text: String(msg.text || ''),
  //         timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  //         isCurrentUser: String(msg.senderId) === String(currentUserId),
  //       };
  //       setMessages((prev) => [...prev, parsed]);
  //     } catch (err) {
  //       console.error('Failed to parse incoming message', err, msg);
  //     }
  //   };

  //   socket.on('receiveBookingMessage', handler);

  //   return () => {
  //     socket.off('receiveBookingMessage', handler);
  //   };
  // }, [bookingId, currentUserId]);
  

  // const sendMessage = (e?: React.FormEvent) => {
  //   if (e && typeof e.preventDefault === 'function') e.preventDefault();
  //   const text = message.trim();
  //   if (!text) return;

  //   const localMsg: Message = {
  //     bookingId,
  //     senderId: currentUserId ?? 'unknown',
  //     text,
  //     timestamp: new Date(),
  //     isCurrentUser: true,
  //   };


  //   socket.emit('sendBookingMessage', {
  //     bookingId: localMsg.bookingId,
  //     senderId: localMsg.senderId,
  //     text: localMsg.text,
  //     timestamp: localMsg.timestamp.toISOString() ?? new Date().toISOString(),
  //   });

  //   setMessage('');
  //   setShowEmojiPicker(false);
  // };

  // useEffect(() => {
  //   const container = messagesContainerRef.current;
  //   if (!container) return;

  //   const scrollToBottom = () => {
  //     container.scrollTo({
  //       top: container.scrollHeight,
  //       behavior: 'smooth',
  //     });
  //   };
  //   const t = window.setTimeout(scrollToBottom, 50);
  //   return () => window.clearTimeout(t);
  // }, [messages]);

  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     sendMessage();
  //   }
  // };

  // const handleEmojiClick = (emoji: string) => {
  //   setMessage(prev => prev + emoji);
  //   inputRef.current?.focus();
  // };

  // const commonEmojis = ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🔥', '💯', '🎉', '😎', '🤔', '😢', '😮', '🙏'];

  // const groupedMessages = messages.reduce((groups: { [date: string]: Message[] }, message) => {
  //   const date = formatDate(message.timestamp);
  //   if (!groups[date]) {
  //     groups[date] = [];
  //   }
  //   groups[date].push(message);
  //   return groups;
  // }, {});

  return (
    <div className="flex flex-col h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5">
                <Circle className="w-4 h-4 text-green-500 fill-current bg-white rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-lg">{name || 'Chat'}</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center space-x-2">
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div> */}
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex items-center justify-center my-6">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
                <span className="text-xs font-medium text-gray-500">{date}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {dateMessages.map((msg, ind) => (
                <div key={ind} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'} group`}>
                  <div className="flex items-end space-x-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                    {msg.senderId !== currentUserId && (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="flex flex-col">
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                          msg.senderId === currentUserId
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                      </div>
                      
                      <div className={`flex items-center mt-1 px-2 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.senderId === currentUserId && (
                          <div className="ml-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {msg.senderId === currentUserId && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))} */}

        {isTyping && (
          <div className="flex justify-start group">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white text-gray-900 border border-gray-200/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-t border-blue-100/50 px-4 py-3 mx-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Professional Service Chat</span>
            <span className="text-blue-600 mx-2">•</span>
            <span className="text-blue-700">Booking ID: {bookingId?.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-700 font-medium">Secure Chat</span>
          </div>
        </div>
      </div> */}

      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-4 py-4 mx-4 rounded-b-xl shadow-lg">
        {showEmojiPicker && (
          <div className="mb-4 bg-white rounded-2xl shadow-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Quick Reactions</span>
              <button 
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {/* {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 text-xl hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  {emoji}
                </button>
              ))} */}
            </div>
          </div>
        )}

        {/* <form  className="flex items-end space-x-3">
          <div className="flex flex-col space-y-2">
            <button 
              type="button" 
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Image className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              // value={message}
              // onChange={(e) => setMessage(e.target.value)}
              // onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {
            // !message.trim() ? (
            //   <button 
            //     type="button"
            //     onClick={() => setIsRecording(!isRecording)}
            //     className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
            //       isRecording 
            //         ? 'bg-red-500 text-white shadow-lg' 
            //         : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            //     }`}
            //   >
            //     <Mic className="w-5 h-5" />
            //   </button>
            // ) :
             (
              <button 
                type="submit" 
                // disabled={!message.trim()} 
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </form> */}
        <BookingChatVideo bookingId={bookingId} currentUserId={user?.name!} />

      </div>
    </div>
  );
};

export default ChatRoom;