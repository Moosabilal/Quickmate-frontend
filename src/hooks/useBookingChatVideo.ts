import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../util/socket";
import { bookingService } from "../services/bookingService";
import { ChatMessage, MaybeStream } from "../interface/IChatAndVideo";

export function useBookingChatVideo(bookingId: string, currentUserId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    const [localStream, setLocalStream] = useState<MaybeStream>(null);
    const [remoteStream, setRemoteStream] = useState<MaybeStream>(null);
    
    const [incomingCall, setIncomingCall] = useState<{
        fromUserId: string;
        fromUserName?: string;
        offer: RTCSessionDescriptionInit;
    } | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended'>('idle');

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MaybeStream>(null);
    const remoteStreamRef = useRef<MaybeStream>(null);

    const rtcConfig: RTCConfiguration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    };

    const ensurePeerConnection = useCallback(() => {
        if (pcRef.current) return pcRef.current;

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("webrtc:ice-candidate", {
                    bookingId,
                    fromUserId: currentUserId,
                    candidate: e.candidate
                });
            }
        };

        pc.ontrack = (ev) => {
            console.log("Received remote stream");
            const [stream] = ev.streams;
            remoteStreamRef.current = stream;
            setRemoteStream(stream); 
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", pc.iceConnectionState);
        };

        pcRef.current = pc;
        return pc;
    }, [bookingId, currentUserId]);

    useEffect(() => {
        const getAllChats = async () => {
            try {
                setLoadingHistory(true); 
                const data = await bookingService.getAllPreviousChat(bookingId)
                const formatted = data.map((msg: any) => ({
                    bookingId: String(msg.bookingId),
                    senderId: String(msg.senderId),
                    text: String(msg.text),
                    timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                    isCurrentUser: String(msg.senderId) === String(currentUserId),
                })) as ChatMessage[];
                setMessages(formatted);
            } catch (error) {
                console.log('Oops Error occurred', error)
            } finally {
                setLoadingHistory(false)
            }
        }
        getAllChats()
    }, [bookingId, currentUserId])

    useEffect(() => {
        if (!bookingId) return;

        socket.emit("joinBookingRoom", bookingId);

        const chatHandler = (msg: any) => {
            const parsed: ChatMessage = {
                bookingId: String(msg.bookingId || bookingId),
                senderId: String(msg.senderId || "unknown"),
                text: String(msg.text || ""),
                timestamp: msg.timestamp ?? new Date().toISOString(),
                isCurrentUser: String(msg.senderId) === String(currentUserId),
                _id: msg._id
            };
            setMessages((prev) => [...prev, parsed]);
        };
        socket.on("receiveBookingMessage", chatHandler);

        const offerHandler = async (payload: { bookingId: string; offer: RTCSessionDescriptionInit; fromUserId: string; fromUserName?: string; }) => {
            if (payload.bookingId !== bookingId || payload.fromUserId === currentUserId) return;
            
            console.log("Received incoming call from:", payload.fromUserId);
            
            setIncomingCall({
                fromUserId: payload.fromUserId,
                fromUserName: payload.fromUserName,
                offer: payload.offer
            });
            setCallStatus('ringing');
            
        };

        const answerHandler = async (payload: { bookingId: string; answer: RTCSessionDescriptionInit; fromUserId: string; }) => {
            if (payload.bookingId !== bookingId || payload.fromUserId === currentUserId) return;
            
            console.log("Received answer from:", payload.fromUserId);
            const pc = ensurePeerConnection();
            
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                setCallStatus('connected');
                console.log("Call connected successfully");
            } catch (error) {
                console.error("Error handling answer:", error);
                setCallStatus('ended');
            }
        };

        const iceHandler = async (payload: { bookingId: string; candidate: RTCIceCandidateInit; fromUserId: string; }) => {
            if (payload.bookingId !== bookingId || payload.fromUserId === currentUserId) return;
            
            const pc = ensurePeerConnection();
            try {
                await pc.addIceCandidate(payload.candidate);
                console.log("Added ICE candidate");
            } catch (err) {
                console.error("Error adding ICE candidate", err);
            }
        };

        const hangupHandler = (payload: { fromUserId: string }) => {
            if (payload.fromUserId !== currentUserId) {
                console.log("Call ended by other user");
                endCall();
            }
        };

        const callRejectedHandler = (payload: { fromUserId: string }) => {
            if (payload.fromUserId !== currentUserId) {
                console.log("Call was rejected");
                setCallStatus('ended');
                endCall();
            }
        };

        socket.on("webrtc:offer", offerHandler);
        socket.on("webrtc:answer", answerHandler);
        socket.on("webrtc:ice-candidate", iceHandler);
        socket.on("webrtc:hangup", hangupHandler);
        socket.on("webrtc:call-rejected", callRejectedHandler);

        return () => {
            socket.off("receiveBookingMessage", chatHandler);
            socket.off("webrtc:offer", offerHandler);
            socket.off("webrtc:answer", answerHandler);
            socket.off("webrtc:ice-candidate", iceHandler);
            socket.off("webrtc:hangup", hangupHandler);
            socket.off("webrtc:call-rejected", callRejectedHandler);
        };
    }, [bookingId, currentUserId, ensurePeerConnection]);

    const sendMessage = useCallback((text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        socket.emit("sendBookingMessage", {
            bookingId,
            senderId: currentUserId,
            text: trimmed,
            timestamp: new Date().toISOString()
        });
    }, [bookingId, currentUserId]);

    const startCall = useCallback(async () => {
        try {
            setCallStatus('calling');
            const pc = ensurePeerConnection();

            if (!localStreamRef.current) {
                console.log("Getting user media...");
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                setLocalStream(localStreamRef.current); 
                
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current!);
                });
            }

            console.log("Creating offer...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("webrtc:offer", { 
                bookingId, 
                offer, 
                fromUserId: currentUserId,
                fromUserName: currentUserId 
            });
            
            console.log("Sent call offer");
        } catch (error) {
            console.error("Error starting call:", error);
            setCallStatus('ended');
            alert("Could not start call: " + error);
        }
    }, [bookingId, currentUserId, ensurePeerConnection]);

    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;

        try {
            setCallStatus('connecting');
            const pc = ensurePeerConnection();

            if (!localStreamRef.current) {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                setLocalStream(localStreamRef.current);
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current!);
                });
            }

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("webrtc:answer", { 
                bookingId, 
                answer, 
                fromUserId: currentUserId 
            });

            setIncomingCall(null);
            setCallStatus('connected');
            console.log("Call accepted and answer sent");
        } catch (error) {
            console.error("Error accepting call:", error);
            rejectCall();
        }
    }, [incomingCall, bookingId, currentUserId, ensurePeerConnection]);

    const rejectCall = useCallback(() => {
        if (!incomingCall) return;

        socket.emit("webrtc:call-rejected", {
            bookingId,
            fromUserId: currentUserId,
            toUserId: incomingCall.fromUserId
        });

        setIncomingCall(null);
        setCallStatus('idle');
        console.log("Call rejected");
    }, [incomingCall, bookingId, currentUserId]);

    const endCall = useCallback(() => {
        console.log("Ending call...");
        
        if (callStatus !== 'idle') {
            socket.emit("webrtc:hangup", { 
                bookingId, 
                fromUserId: currentUserId 
            });
        }

        if (pcRef.current) {
            pcRef.current.getSenders().forEach(sender => {
                if (sender.track) {
                    sender.track.stop();
                }
            });
            pcRef.current.close();
            pcRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null); 
        }

        remoteStreamRef.current = null;
        setRemoteStream(null);
        
        setIncomingCall(null);
        setCallStatus('idle');
    }, [bookingId, currentUserId, callStatus]);

    return {
        messages,
        loadingHistory,
        sendMessage,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        localStream,
        remoteStream,
        localStreamRef,
        remoteStreamRef,
        incomingCall,
        callStatus,
    };
}