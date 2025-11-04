/* eslint-env browser */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { socket } from "../util/socket";
import { bookingService } from "../services/bookingService";
import { ChatMessage, MaybeStream } from "../util/interface/IChatAndVideo";
import { useCallStore } from "../app/callStore";

export function useBookingChatVideo(currentUserId: string, joiningId: string) {
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
    const iceCandidateQueueRef = useRef<RTCIceCandidate[]>([]);

    const cleanupCall = useCallback(() => {
        console.log("Running call cleanup...");

        iceCandidateQueueRef.current = [];
        setIsAudioMuted(false);
        setIsVideoOff(false);

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

        pcRef.current = pc;
        return pc;
    }, [currentUserId, joiningId, rtcConfig]);

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
                const formatted = data.map((msg: any) => ({
                    joiningId: String(msg.joiningId),
                    senderId: String(msg.senderId),
                    text: String(msg.text),
                    timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                    isCurrentUser: String(msg.senderId) === String(currentUserId),
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

        const chatHandler = (msg: any) => {
            const parsed: ChatMessage = {
                joiningId: String(msg.joiningId || joiningId),
                senderId: String(msg.senderId || "unknown"),
                text: String(msg.text || ""),
                timestamp: msg.timestamp ?? new Date().toISOString(),
                isCurrentUser: String(msg.senderId) === String(currentUserId),
                _id: msg._id,
            };
            setMessages((prev) => [...prev, parsed]);
        };

        const offerHandler = async (payload: any) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) {
                return;
            }
            setIncomingCall(payload);
        };

        const answerHandler = async (payload: any) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;
            const pc = ensurePeerConnection();
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                processIceQueue();
                setCallStatus("connected");
            } catch (error) {
                console.error("Error handling answer:", error);
                setCallStatus("ended");
            }
        };

        const iceHandler = async (payload: any) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;
            const pc = ensurePeerConnection();
            if (pc.remoteDescription) {
                await pc.addIceCandidate(payload.candidate);
            } else {
                iceCandidateQueueRef.current.push(payload.candidate);
            }
        };

        const hangupHandler = (payload: any) => {
            if (payload.joiningId !== joiningId || payload.fromUserId === currentUserId) return;

            cleanupCall();

            setIncomingCall(null);
            setCallStatus("ended");
        };

        const callRejectedHandler = (payload: any) => {
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

    const sendMessage = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;
            socket.emit("sendBookingMessage", {
                joiningId,
                senderId: currentUserId,
                text: trimmed,
                timestamp: new Date().toISOString(),
            });
        },
        [joiningId, currentUserId]
    );

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
                fromUserName: currentUserId,
            });
        } catch (error) {
            console.error("Error in startCall:", error);
            setCallStatus("ended");
        }
    }, [joiningId, currentUserId, ensurePeerConnection]);



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

        try {
            setCallStatus("connecting");
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
            setCallStatus("connected");
        } catch (error) {
            console.error("Error in acceptCall:", error);
            rejectCall();
        }
    }, [ensurePeerConnection, processIceQueue, joiningId, currentUserId, setIncomingCall, rejectCall]);

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