export interface ChatbotMessage {
    hideInChat?: boolean;
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    timestamp?: Date;
    id?: string;
}

export interface ChatMessageProps {
    chat: ChatbotMessage;
}

export interface Testimonial {
    id: number;
    author: string;
    rating: number;
    text: string;
}

export interface StarRatingProps {
    rating: number;
}

export interface QuickAction {
    id: string;
    label: string;
    action: string;
}