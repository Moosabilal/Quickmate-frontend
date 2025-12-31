import { useEffect, useRef, useState } from "react";
import { useBookingChatVideo } from "../hooks/useBookingChatVideo";
import { Mic, MicOff, Paperclip, Send, Smile, X, Phone, Video, VideoOff, Download, FileText } from "lucide-react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useCallStore } from "../app/callStore";
import { getCloudinaryDownloadUrl, getCloudinaryUrl } from "../util/cloudinary";
import { useAppSelector } from "../hooks/useAppSelector";

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
  const { user } = useAppSelector(state => state.auth);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const { incomingCall: _globalIncomingCall, setIncomingCall } = useCallStore();

  const {
    messages,
    loadingHistory,
    sendMessage,
    uploadAndSendFile,
    startCall,
    acceptCall,
    endCall,
    localStream,
    remoteStream,
    callStatus,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoOff,
  } = useBookingChatVideo(currentUserId, joiningId, user?.name || 'Unknown');

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  }, [incomingCall, mode, callStatus, setIncomingCall, acceptCall]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndSendFile(file);
    }
    if (e.target) e.target.value = '';
  };

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
      <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div ref={messagesContainerRef} className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {loadingHistory && <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading chat history...</div>}
          {messages.map((m, i) => (
            <div key={m._id || i} className={`flex my-2 ${m.isCurrentUser ? 'justify-end' : 'justify-start'}`}>

              <div
                className={`relative max-w-[85%] md:max-w-md lg:max-w-lg rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 
                                ${m.isCurrentUser
                    ? 'bg-[#DCF8C6] dark:bg-green-800 dark:text-gray-100'
                    : 'bg-white dark:bg-gray-800 dark:text-gray-100'
                  } ${m.messageType === 'image' ? 'p-1.5' : 'px-4 py-3'}`}
              >

                {m.messageType === 'image' && (
                  <img
                    src={
                      m.fileUrl?.startsWith('blob:') || m.fileUrl?.startsWith('http')
                        ? m.fileUrl
                        : getCloudinaryUrl(m.fileUrl!, 'image')
                    }
                    alt="Uploaded attachment"
                    className="rounded-lg max-w-full"
                    onLoad={() => {
                      if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                      }
                    }}
                    crossOrigin="anonymous"
                  />
                )}

                {m.messageType === 'file' && (
                  <a
                    href={m.fileUrl?.startsWith('blob:') ? m.fileUrl : getCloudinaryDownloadUrl(m.fileUrl!)} target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors 
                                            ${m.isCurrentUser
                        ? 'bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    <FileText className="w-8 h-8 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${m.isCurrentUser ? 'text-gray-800 dark:text-gray-100' : 'text-gray-800 dark:text-gray-200'}`}>
                        {m.isPending ? m.text : (m.fileUrl?.split('/').pop() || 'Download File')}
                      </p>
                      <p className={`text-xs ${m.isCurrentUser ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {m.isPending ? "Please wait..." : "File Attachment"}
                      </p>
                    </div>
                    {!m.isPending && <Download className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" />}
                  </a>
                )}

                {m.messageType === 'text' && (
                  <p className="text-sm md:text-base break-words leading-relaxed">{m.text}</p>
                )}

                <div className={`text-[10px] md:text-xs mt-1 
                                    ${m.isCurrentUser
                    ? 'text-gray-500 dark:text-green-200'
                    : 'text-gray-400 dark:text-gray-500'
                  } 
                                    ${m.messageType === 'text' ? 'float-right ml-2' : 'text-right'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-2 md:gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage({ text: input.trim(), messageType: 'text' });
              setInput("");
            }
          }}
        >
          <div className="flex-grow flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <button
              type="button"
              aria-label="Toggle emoji picker"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <Smile className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <input
              className="w-full bg-transparent focus:outline-none mx-3 text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef}
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
            <button
              type="button"
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <button
            className="p-3 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-full flex-shrink-0 focus:outline-none shadow-lg transition-transform active:scale-95"
            type="submit"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 max-w-[90vw] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Quick Reactions</span>
              <button
                type="button"
                aria-label="Close emoji picker"
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  aria-label={`Insert emoji ${emoji}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
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
      <div className="relative flex flex-col h-full w-full bg-gray-900 text-white items-center justify-center overflow-hidden">
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
          className="absolute top-4 right-4 w-28 h-20 md:w-48 md:h-36 rounded-lg shadow-2xl border-2 border-white/20 z-10 object-cover bg-gray-800"
        />

        <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-sm p-3 rounded-lg text-white border border-white/10">
          <h2 className="text-sm md:text-xl font-semibold">Video call with {name || "Unknown"}</h2>
          <p className="text-xs md:text-sm text-gray-300">{getCallStatusText()}</p>
        </div>

        <div className="absolute bottom-10 z-10 flex items-center gap-4 md:space-x-6 bg-black/40 backdrop-blur-md p-4 rounded-full border border-white/10">
          <button
            onClick={toggleAudio}
            className={`p-3 md:p-4 rounded-full transition-all duration-300 ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
            aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}>
            {isAudioMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 md:p-4 rounded-full transition-all duration-300 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
            aria-label={isVideoOff ? "Turn on video" : "Turn off video"}>
            {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          <button
            type="button"
            aria-label="End call"
            onClick={handleEndCallAndGoBack}
            title="End call"
            className="p-3 md:p-4 bg-red-600 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
          >
            <Phone className="w-5 h-5 md:w-7 md:h-7" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}