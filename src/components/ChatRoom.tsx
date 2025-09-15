import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../util/socket'
import { Send, Video, Phone, MoreVertical, Paperclip, Smile, ArrowLeft, User, Circle, Image, Mic, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { bookingService } from '../services/bookingService';
import BookingChatVideo from './BookingChatVideo';

const ChatRoom: React.FC = () => {

  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);

  const {name, joiningId } = location.state as { name: string; joiningId: string };
  


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

      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-4 py-4 mx-4 rounded-b-xl shadow-lg">
        
        <BookingChatVideo currentUserId={user?.name!} joiningId={joiningId} />

      </div>
    </div>
  );
};

export default ChatRoom;