import { useEffect, useRef, useState } from "react";
import { useBookingChatVideo } from "../hooks/useBookingChatVideo";
import { Image, Mic, Paperclip, Send, Smile, User, X } from "lucide-react";

export default function BookingChatVideo({
  bookingId,
  currentUserId
}: { bookingId: string; currentUserId: string }) {
  const [input, setInput] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
    incomingCall,
    callStatus,
    localStreamRef,
    remoteStreamRef
  } = useBookingChatVideo(bookingId, currentUserId);

  console.log('the messages', messages)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const localVideoEl = useRef<HTMLVideoElement>(null);
  const remoteVideoEl = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);


  useEffect(() => {
    if (localVideoEl.current) {
      localVideoEl.current.srcObject = localStream;
      if (localStream) {
        console.log("Local stream attached to video element");
        setIsCallActive(true);
      } else {
        setIsCallActive(false);
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoEl.current) {
      remoteVideoEl.current.srcObject = remoteStream;
      if (remoteStream) {
        console.log("Remote stream attached to video element");
      }
    }
  }, [remoteStream]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollToBottom = () => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    };
    const t = window.setTimeout(scrollToBottom, 50);
    return () => window.clearTimeout(t);
  }, [messages]);

  // const formatDate = (dateInput?: Date | string | number) => {
  //   if (!dateInput) return '';
  //   const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  //   if (isNaN(d.getTime())) return '';
  //   const today = new Date();
  //   const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  //   const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  //   if (messageDate.getTime() === todayDate.getTime()) {
  //     return 'Today';
  //   } else if (messageDate.getTime() === todayDate.getTime() - 86400000) {
  //     return 'Yesterday';
  //   } else {
  //     return d.toLocaleDateString();
  //   }
  // };


  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const commonEmojis = ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🔥', '💯', '🎉', '😎', '🤔', '😢', '😮', '🙏'];


  const getCallStatusText = () => {
    switch (callStatus) {
      case 'calling': return 'Calling...';
      case 'ringing': return 'Incoming call';
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      default: return 'No active call';
    }
  };

  const handleStartCall = async () => {
    try {
      await startCall();
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const handleEndCall = () => {
    endCall();
    setIsCallActive(false);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border rounded-2xl p-4 bg-white">
        <h3 className="font-semibold mb-2">Booking Chat</h3>
        <div ref={messagesContainerRef} className="h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
          {loadingHistory && <div className="text-sm text-gray-500">Loading…</div>}
          {messages.map((m, i) => (
            <div key={m._id || i} className={`mb-2 ${m.isCurrentUser ? "text-right" : "text-left"}`}>
              <div className={`inline-block px-3 py-2 rounded-xl max-w-[70%] ${m.isCurrentUser
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-gray-800"
                }`}>
                <div className="text-sm break-words">{m.text}</div>
                <div className={`text-[10px] mt-1 ${m.isCurrentUser ? "text-indigo-100" : "text-gray-500"
                  }`}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
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

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage(input.trim());
              setInput("");
            }
          }}
        >
          <div className="flex items-center space-x-3 w-full">
            {/* <div className="flex flex-row space-x-2">
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
            </div> */}


            <div className="relative flex-1">
              <input
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type a message…"
                value={input}
                ref={inputRef}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>



          {
            // !input.trim() ? (
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
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                type="submit"
                disabled={!input.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
        </form>
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

      <div className="border rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Video Call</h3>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              callStatus === 'calling' || callStatus === 'ringing' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-300'
              }`}></div>
            <span className={`text-sm font-medium ${callStatus === 'connected' ? 'text-green-600' :
              callStatus === 'calling' || callStatus === 'ringing' ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
              {getCallStatusText()}
            </span>
          </div>
        </div>

        {incomingCall && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="font-semibold text-blue-900 mb-1">Incoming Video Call</h4>
              <p className="text-blue-700 text-sm mb-4">
                {incomingCall.fromUserName || incomingCall.fromUserId} is calling you
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={acceptCall}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Accept</span>
                </button>
                <button
                  onClick={rejectCall}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.664 1.664M21 21l-1.664-1.664M3 3l18 18" />
                  </svg>
                  <span>Decline</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <video
            ref={remoteVideoEl}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-gray-900 aspect-video"
            style={{ minHeight: '200px' }}
          />

          <video
            ref={localVideoEl}
            autoPlay
            playsInline
            muted
            className="absolute bottom-2 right-2 w-24 h-18 rounded-lg bg-gray-800 border-2 border-white"
          />

          {!localStream && !remoteStream && !incomingCall && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No active call</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {callStatus === 'idle' && !incomingCall && (
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
              onClick={handleStartCall}
            >
              Start Call
            </button>
          )}
          {callStatus === 'calling' && (
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
              onClick={handleEndCall}
            >
              Cancel Call
            </button>
          )}
          {(callStatus === 'connected' || callStatus === 'connecting') && (
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
              onClick={handleEndCall}
            >
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}