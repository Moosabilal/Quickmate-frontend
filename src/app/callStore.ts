import {create} from 'zustand';

interface IncomingCall {
  fromUserId: string;
  fromUserName?: string;
  offer: RTCSessionDescriptionInit;
  joiningId: string;
}

interface CallState {
  incomingCall: IncomingCall | null;
  setIncomingCall: (call: IncomingCall | null) => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  setIncomingCall: (call) => set({ incomingCall: call }),
}));