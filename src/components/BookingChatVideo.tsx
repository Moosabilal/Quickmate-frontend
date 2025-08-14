import { useEffect, useRef, useState } from "react";
import { useBookingChatVideo } from "../hooks/useBookingChatVideo";

export default function BookingChatVideo({
  bookingId,
  currentUserId
}: { bookingId: string; currentUserId: string }) {
  const [input, setInput] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  
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

  const localVideoEl = useRef<HTMLVideoElement>(null);
  const remoteVideoEl = useRef<HTMLVideoElement>(null);

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
        <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
          {loadingHistory && <div className="text-sm text-gray-500">Loading…</div>}
          {messages.map((m, i) => (
            <div key={m._id || i} className={`mb-2 ${m.isCurrentUser ? "text-right" : "text-left"}`}>
              <div className={`inline-block px-3 py-2 rounded-xl max-w-[70%] ${
                m.isCurrentUser 
                  ? "bg-indigo-500 text-white" 
                  : "bg-gray-200 text-gray-800"
              }`}>
                <div className="text-sm break-words">{m.text}</div>
                <div className={`text-[10px] mt-1 ${
                  m.isCurrentUser ? "text-indigo-100" : "text-gray-500"
                }`}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
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
          <input
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" 
            type="submit"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <div className="border rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Video Call</h3>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              callStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              callStatus === 'calling' || callStatus === 'ringing' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-300'
            }`}></div>
            <span className={`text-sm font-medium ${
              callStatus === 'connected' ? 'text-green-600' :
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