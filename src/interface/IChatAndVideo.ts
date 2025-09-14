export interface ChatMessage {
    _id?: string;
    bookingId: string;
    senderId: string;
    text: string;
    timestamp: string | Date;
    isCurrentUser?: boolean;
}

export type MaybeStream = MediaStream | null;