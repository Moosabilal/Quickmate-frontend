import React from "react";
import { IBookingRequest } from "./IBooking";

export interface ChatbotMessage {
    hideInChat?: boolean;
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    timestamp?: Date;
    id?: string;
    options?: ChatOption[];
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

export interface ChatbotIconProps {
    className?: string;
}

export interface ChatFormProps {
    chatHistory: ChatbotMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatbotMessage[]>>;
    generateBotResponse: (history: ChatbotMessage[]) => Promise<void>;
}

export interface IChatbotResponse {
    role: 'model';
    text: string;
    action?: 'REQUIRE_PAYMENT'; 
    payload?: {
        orderId: string;
        amount: number;
        bookingData: IBookingRequest; 
    },
    options?: ChatOption[];
}

export interface IChatPaymentVerify {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingData: IBookingRequest;
}

export type ChatOption = string | {
    id?: string;
    index?: number;
    label?: string;
    street?: string;
    city?: string;
    name?: string;
    price?: number;
    rating?: number;
};

export interface IChatHistoryMessage {
    _id: string;
    role: 'user' | 'model';
    text: string;
    createdAt: string;
}