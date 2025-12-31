/* eslint-env browser */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { socket } from "../util/socket";
import { bookingService } from "../services/bookingService";
import { ChatMessage, MaybeStream } from "../util/interface/IChatAndVideo";
import { useCallStore } from "../app/callStore";
import { fileService } from "../services/fileService";
import { toast } from "react-toastify";

export function useBookingChatVideo(currentUserId: string, joiningId: string, userName: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { setIncomingCall } = useCallStore();

    const [localStream, setLocalStream] = useState<MaybeStream>(null);
    const [remoteStream, setRemoteStream] = useState<MaybeStream>(null);

    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const [callStatus, setCallStatus] = useState<
        "idle" | "calling" | "ringing" | "connecting" | "connected" | "ended"
    >("idle");

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MaybeStream>(null);
    const remoteStreamRef = useRef<MaybeStream>(null);
    const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
    const isAcceptingCallRef = useRef(false);

    const cleanupCall = useCallback(() => {
        console.log("Running call cleanup...");

        iceCandidateQueueRef.current = [];
        setIsAudioMuted(false);
        setIsVideoOff(false);
        isAcceptingCallRef.current = false;

        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }
        setLocalStream(null);

        if (pcRef.current) {
            pcRef.current.getSenders().forEach((sender) => sender.track?.stop());
            pcRef.current.close();
            pcRef.current = null;
        }

        setRemoteStream(null);
    }, [localStream]);

    const rtcConfig = useMemo<RTCConfiguration>(
        () => ({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                // Add TURN servers for better connectivity across firewalls/NATs
                // Note: Replace with your own TURN server credentials in production
                {
                    urls: "turn:turn.quickmate.com:3478",
                    username: "quickmate-user",
                    credential: "quickmate-pass"
                },
                {
                    urls: "turn:turn.quickmate.com:3478?transport=tcp",
                    username: "quickmate-user",
                    credential: "quickmate-pass"
                }
            ],
        }),
        []
    );

    const ensurePeerConnection = useCallback(() => {
        if (pcRef.current) {
            return pcRef.current;
        }

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("webrtc:ice-candidate", {
                    joiningId,
                    fromUserId: currentUserId,
                    candidate: e.candidate,
                });
            }
        };

        pc.ontrack = (ev) => {
            const [stream] = ev.streams;
            remoteStreamRef.current = stream;
            setRemoteStream(stream);
        };

        pc.onconnectionstatechange = () => {
            console.log("WebRTC Connection State:", pc.connectionState);
            switch (pc.connectionState) {
                case "connected":
                    setCallStatus("connected");
                    break;
                case "disconnected":
                case "failed":
                    console.error("WebRTC connection failed");
                    setCallStatus("ended");
                    cleanupCall();
                    break;
                case "closed":
                    setCallStatus("ended");
                    break;
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", pc.iceConnectionState);
            if (pc.iceConnectionState === "failed") {
                console.error("ICE connection failed");
                setCallStatus("ended");
                cleanupCall();
            }
        };

        pcRef.current = pc;
        return pc;
    }, [currentUserId, joiningId, rtcConfig, cleanupCall]);

    const processIceQueue = useCallback(() => {
        if (pcRef.current) {
            iceCandidateQueueRef.current.forEach((candidate) => {
                pcRef.current!
                    .addIceCandidate(candidate)
                    .then(() => { })
                    .catch((e) => console.error("Error adding queued ICE:", e));
            });
            iceCandidateQueueRef.current = [];
        }
    }, []);

useEffect(() => {
    const getAllChats = async () => {
        try {
            setLoadingHistory(true);
            const data = await bookingService.getAllPreviousChat(joiningId);
            
            const formatted = data.map((msg: ChatMessage) => ({
                joiningId: String(msg.joiningId),
                senderId: String(msg.senderId),
                timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                isCurrentUser: String(msg.senderId) === String(currentUserId),
                _id: msg._id,
                
                messageType: msg.messageType || 'text',
                text: msg.text,
                fileUrl: msg.fileUrl,
                isPending: false 
            })) as ChatMessage[];
            
            setMessages(formatted);
        } catch (error) {
            console.error("  [History] Error fetching chat history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };
    if (joiningId) getAllChats();
}, [currentUserId, joiningId]);

    useEffect(() => {
        if (!joiningId) return;

        socket.emit("joinBookingRoom", joiningId);

        const chatHandler = (msg: ChatMessage) => {
            console.log("💬 New chat message received:", msg);

            const parsed: ChatMessage = {
                joiningId: String(msg.joiningId || joiningId),
                senderId: String(msg.senderId || "unknown"),
                timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
                isCurrentUser: String(msg.senderId) === String(currentUserId),
                _id: msg._id,

                messageType: msg.messageType || 'text',
                text: msg.text,
                fileUrl: msg.fileUrl,
                isPending: false 
            };
            setMessages((prev) => [...prev, parsed]);
        };

        const offerHandler = async (payload: {
            joiningId: string;
            offer: RTCSessionDescriptionInit;
            fromUserId: string;
            fromUserName?: string;
        }) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) {
                return;
            }
            setIncomingCall(payload);
        };

        const answerHandler = async (payload: {
            joiningId: string;
            answer: RTCSessionDescriptionInit;
            fromUserId: string;
        }) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;
            const pc = ensurePeerConnection();
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                processIceQueue();
            } catch (error) {
                console.error("Error handling answer:", error);
                setCallStatus("ended");
                cleanupCall();
            }
        };

        const iceHandler = async (payload: {
            joiningId: string;
            candidate: RTCIceCandidateInit;
            fromUserId: string;
        }) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;
            const pc = ensurePeerConnection();
            if (pc.remoteDescription) {
                await pc.addIceCandidate(payload.candidate);
            } else {
                iceCandidateQueueRef.current.push(payload.candidate);
            }
        };

        const hangupHandler = (payload: { joiningId: string; fromUserId: string }) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;

            cleanupCall();

            setIncomingCall(null);
            setCallStatus("ended");
        };

        const callRejectedHandler = (payload: {
            joiningId: string;
            fromUserId: string;
            toUserId: string;
        }) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;
            cleanupCall();
            setIncomingCall(null);
            setCallStatus("ended");

        };

        socket.on("receiveBookingMessage", chatHandler);
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
    }, [joiningId, currentUserId, ensurePeerConnection, processIceQueue, setIncomingCall, cleanupCall]);

    const sendMessage = useCallback((messageData: {
        text?: string;
        messageType: 'text' | 'image' | 'file';
        fileUrl?: string;
    }) => {
        if (!messageData.text && !messageData.fileUrl) return;

        if (messageData.messageType === 'text' && !messageData.text?.trim()) return;

        socket.emit("sendBookingMessage", {
            joiningId,
            senderId: currentUserId,
            messageType: messageData.messageType,
            text: messageData.text?.trim(),
            fileUrl: messageData.fileUrl,
            createdAt: new Date().toISOString()
        });
    }, [joiningId, currentUserId]);


    const uploadAndSendFile = useCallback(async (file: File) => {
        const pendingId = `pending-${Date.now()}`;

        try {
            const pendingMessage: ChatMessage = {
                _id: pendingId,
                joiningId,
                senderId: currentUserId,
                messageType: file.type.startsWith('image/') ? 'image' : 'file',
                text: `Uploading ${file.name}...`,
                fileUrl: URL.createObjectURL(file),
                timestamp: new Date(),
                isCurrentUser: true,
                isPending: true,
            };
            setMessages((prev) => [...prev, pendingMessage]);

            const { url } = await fileService.uploadChatFile(file);

            sendMessage({
                messageType: file.type.startsWith('image/') ? 'image' : 'file',
                fileUrl: url
            });

            setMessages((prev) => prev.filter(m => m._id !== pendingId));

        } catch (err) {
            console.error("File upload failed:", err);
            toast.error("File upload failed.");
            setMessages((prev) => prev.filter(m => m._id !== pendingId));
        }
    }, [joiningId, currentUserId, sendMessage]);




    const startCall = useCallback(async () => {
        try {
            setCallStatus("calling");
            const pc = ensurePeerConnection();

            if (!localStreamRef.current) {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(localStreamRef.current);
                localStreamRef.current.getTracks().forEach((track) =>
                    pc.addTrack(track, localStreamRef.current!)
                );
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("webrtc:offer", {
                joiningId,
                offer,
                fromUserId: currentUserId,
                fromUserName: userName,
            });
        } catch (error) {
            console.error("Error in startCall:", error);
            if (error instanceof DOMException) {
                if (error.name === "NotAllowedError") {
                    alert("Camera and microphone access denied. Please allow access to make video calls.");
                } else if (error.name === "NotFoundError") {
                    alert("No camera or microphone found. Please connect a camera and microphone.");
                } else {
                    alert("Error accessing camera/microphone: " + error.message);
                }
            }
            setCallStatus("ended");
            cleanupCall();
        }
    }, [joiningId, currentUserId, ensurePeerConnection, cleanupCall, userName]);



    const rejectCall = useCallback(() => {
        const { incomingCall } = useCallStore.getState();
        if (!incomingCall) return;

        socket.emit("webrtc:call-rejected", {
            joiningId,
            fromUserId: currentUserId,
            toUserId: incomingCall.fromUserId,
        });

        setIncomingCall(null);
        setCallStatus("idle");

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
    }, [joiningId, currentUserId, setIncomingCall]);

    const acceptCall = useCallback(async () => {
        const { incomingCall } = useCallStore.getState();
        if (!incomingCall) {
            console.error("   -> acceptCall failed: No incoming call in store.");
            return;
        }

        if (isAcceptingCallRef.current) {
            console.log("Accept call already in progress, ignoring duplicate call");
            return;
        }

        isAcceptingCallRef.current = true;

        try {
            setCallStatus("connecting");
            const pc = ensurePeerConnection();

            if (pc.signalingState !== "stable") {
                console.log("Peer connection not in stable state, skipping acceptCall");
                isAcceptingCallRef.current = false;
                return;
            }

            if (!localStreamRef.current) {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(localStreamRef.current);
                localStreamRef.current.getTracks().forEach((track) =>
                    pc.addTrack(track, localStreamRef.current!)
                );
            }

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            processIceQueue();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("webrtc:answer", {
                joiningId,
                answer,
                fromUserId: currentUserId,
            });

            setIncomingCall(null);
        } catch (error) {
            console.error("Error in acceptCall:", error);
            if (error instanceof DOMException) {
                if (error.name === "NotAllowedError") {
                    alert("Camera and microphone access denied. Please allow access to make video calls.");
                } else if (error.name === "NotFoundError") {
                    alert("No camera or microphone found. Please connect a camera and microphone.");
                } else {
                    alert("Error accessing camera/microphone: " + error.message);
                }
            }
            rejectCall();
            cleanupCall();
        } finally {
            isAcceptingCallRef.current = false;
        }
    }, [ensurePeerConnection, processIceQueue, joiningId, currentUserId, setIncomingCall, rejectCall, cleanupCall]);

    const endCall = useCallback(() => {
        if (callStatus !== "idle") {
            socket.emit("webrtc:hangup", { joiningId, fromUserId: currentUserId });
        }

        cleanupCall();

        setIncomingCall(null);
        setCallStatus("idle");
    }, [joiningId, currentUserId, callStatus, setIncomingCall, cleanupCall]);

    useEffect(() => {
        const { incomingCall } = useCallStore.getState();
        if (incomingCall && incomingCall.joiningId === joiningId && incomingCall.fromUserId !== currentUserId) {
            acceptCall();
        }
    }, [joiningId, currentUserId, acceptCall]);

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
                setIsAudioMuted(!track.enabled);
            });
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
                setIsVideoOff(!track.enabled);
            });
        }
    }, []);

    return {
        messages,
        loadingHistory,
        sendMessage,
        uploadAndSendFile,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        localStream,
        remoteStream,
        localStreamRef,
        remoteStreamRef,
        callStatus,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoOff,
    };
}