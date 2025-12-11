export interface ChatMessage {
    _id?: string;
    joiningId: string;
    senderId: string;
    timestamp: string | Date;
    isCurrentUser?: boolean;
    createdAt?: string | Date;
    
    messageType: 'text' | 'image' | 'file';
    text?: string; 
    fileUrl?: string;
    isPending?: boolean;
}

export type MaybeStream = MediaStream | null;