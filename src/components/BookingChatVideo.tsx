import { useEffect, useRef, useState } from "react";
import { useBookingChatVideo } from "../hooks/useBookingChatVideo";
import { Mic, MicOff, Paperclip, Send, Smile, X, Phone, Video, VideoOff, Download, FileText } from "lucide-react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useCallStore } from "../app/callStore";
import { getCloudinaryDownloadUrl, getCloudinaryUrl } from "../util/cloudinary";

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
    offer: RTCSessionDescription;
    fromUserId: string;
    fromUserName?: string;
  },
  isInitiator?: boolean
}) {
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
  } = useBookingChatVideo(currentUserId, joiningId);

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
      <div className="flex flex-col h-full p-4">
        <div ref={messagesContainerRef} className="flex-grow overflow-y-auto mb-4">
          {loadingHistory && <div className="text-center text-sm text-gray-500">Loading chat history...</div>}
          {messages.map((m, i) => (
            <div key={m._id || i} className={`flex my-2 ${m.isCurrentUser ? 'justify-end' : 'justify-start'}`}>

              <div
                className={`relative max-w-xs lg:max-w-md rounded-lg shadow ${m.isCurrentUser ? 'bg-[#DCF8C6]' : 'bg-white'} ${m.messageType === 'image' ? 'p-1.5' : 'px-3 py-2'}`}
              >

                {m.messageType === 'image' && (
                  <img
                    src={m.fileUrl?.startsWith('blob:') ? m.fileUrl : getCloudinaryUrl(m.fileUrl!, 'image')}
                    alt="Uploaded attachment"
                    className="rounded-md max-w-full"
                    onLoad={() => {
                      if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                      }
                    }}
                  />
                )}

                {m.messageType === 'file' && (
                  <a
                    href={m.fileUrl?.startsWith('blob:') ? m.fileUrl : getCloudinaryDownloadUrl(m.fileUrl!)} target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <FileText className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-800 dark:text-gray-200 text-sm font-medium truncate">
                        {m.isPending ? m.text : (m.fileUrl?.split('/').pop() || 'Download File')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m.isPending ? "Please wait..." : "File Attachment"}
                      </p>
                    </div>
                    {!m.isPending && <Download className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />}
                  </a>
                )}

                {m.messageType === 'text' && (
                  <p className="text-gray-800 text-sm break-words">{m.text}</p>
                )}

                <div className={`text-xs text-gray-400 ml-2 mt-1 ${m.messageType === 'text' ? 'float-right' : 'text-right'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage({ text: input.trim(), messageType: 'text' });
              setInput("");
            }
          }}
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*" 
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="text-gray-500" />
            </button>
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
