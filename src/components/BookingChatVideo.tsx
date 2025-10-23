import { useEffect, useRef, useState } from "react";
import { useBookingChatVideo } from "../hooks/useBookingChatVideo";
import { Mic, MicOff, Paperclip, Send, Smile, X, Phone, Video, VideoOff } from "lucide-react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useCallStore } from "../app/callStore";

export default function BookingChatVideo({
  currentUserId,
  joiningId,
  mode,
  name,
  incomingCall,
  isInitiator = false
}: { 
  currentUserId: string, 
  joiningId: string, 
  mode: 'chat' | 'video',
  name?: string,
  incomingCall?: {
    joiningId: string;
    offer: RTCSessionDescriptionInit;
    fromUserId: string;
    fromUserName?: string;
  },
  isInitiator?: boolean
}) {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const { incomingCall: globalIncomingCall, setIncomingCall } = useCallStore();

  const {
    messages,
    loadingHistory,
    sendMessage,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    localStream,
    remoteStream,
    callStatus,
    toggleAudio, 
    toggleVideo, 
    isAudioMuted, 
    isVideoOff, 
  } = useBookingChatVideo(currentUserId, joiningId);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isInitiator && mode === 'video' && callStatus === 'idle') {
      startCall();
    }
  }, [isInitiator, mode, callStatus, startCall]);

  useEffect(() => {
    if (incomingCall && mode === 'video' && callStatus === 'idle') {
      setIncomingCall(incomingCall);
      setTimeout(() => {
        try { 
          acceptCall();
        } catch (e) {
          console.error('Auto-accept failed:', e);
        }
      }, 0);
    }
  }, [incomingCall, mode, callStatus, setIncomingCall]);

  useEffect(() => {
    if (mode === 'video' && callStatus === 'ended') {
      toast.info('Call rejected or ended by the other user');
      navigate(-1);
    }
  }, [mode, callStatus, navigate]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleEndCallAndGoBack = () => {
    endCall();
    navigate(-1);
  };
  
  const getCallStatusText = () => { 
    switch (callStatus) {
      case 'calling': return 'Calling...';
      case 'ringing': return 'Incoming call';
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      default: return 'No active call';
    }
  };

  const handleEmojiClick = (emoji: string) => { 
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const commonEmojis = ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🔥', '💯', '🎉', '😎', '🤔', '😢', '😮', '🙏'];

  if (mode === 'chat') {
    return (
      <div className="flex flex-col h-full p-4">
        <div ref={messagesContainerRef} className="flex-grow overflow-y-auto mb-4">
          {loadingHistory && <div className="text-center text-sm text-gray-500">Loading chat history...</div>}
          {messages.map((m, i) => (
            <div key={m._id || i} className={`flex my-2 ${m.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${m.isCurrentUser ? 'bg-[#DCF8C6]' : 'bg-white'}`}>
                <p className="text-gray-800 text-sm break-words">{m.text}</p>
                <span className="text-xs text-gray-400 float-right ml-2 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-3"
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage(input.trim()); setInput(""); } }}
        >
          <div className="flex-grow flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile className="text-gray-500" /></button>
            <input
              className="w-full bg-transparent focus:outline-none mx-3 text-gray-700"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef}
            />
            <button type="button"><Paperclip className="text-gray-500" /></button>
          </div>
          <button
            className="p-3 bg-[#00A884] text-white rounded-full flex-shrink-0 focus:outline-none shadow-lg"
            type="submit"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 bg-white rounded-2xl shadow-xl border border-gray-200/50 p-4 z-20">
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
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 text-xl hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'video') {
    return (
       <div className="relative flex flex-col h-full w-full bg-gray-900 text-white items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-40 h-30 rounded-lg shadow-2xl border-2 border-white z-10 object-cover"
        />
        
        <div className="absolute top-4 left-4 z-10 bg-black/50 p-3 rounded-lg text-white">
            <h2 className="text-xl font-semibold">Video call with {name || "Unknown"}</h2>
            <p className="text-sm text-gray-300">{getCallStatusText()}</p>
        </div>

        <div className="absolute bottom-10 z-10 flex items-center space-x-6 bg-black/50 p-4 rounded-full">
            <button 
                onClick={toggleAudio}
                className={`p-3 rounded-full hover:bg-white/30 ${isAudioMuted ? 'bg-red-500' : 'bg-white/20'}`}
            >
                {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button 
                onClick={toggleVideo}
                className={`p-3 rounded-full hover:bg-white/30 ${isVideoOff ? 'bg-red-500' : 'bg-white/20'}`}
            >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <button 
                onClick={handleEndCallAndGoBack}
                className="p-4 bg-red-600 rounded-full hover:bg-red-700"
            >
                <Phone size={28} />
            </button>
        </div>
      </div>
    );
  }

  return null;
}
