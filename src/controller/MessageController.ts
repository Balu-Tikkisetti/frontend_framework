// src/controller/MessageController.ts
import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8080/api/message";

export interface MessageBuddyDTO {
  userId: number;
  username: string;
  profilePicture: string;
  isOnline: boolean;
  status: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  isTyping: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type?: "text" | "system";
}

export const sendMessageRequest = async (senderId: number, recipientId: number): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await axios.post(
      `${API_BASE_URL}/message-request/${senderId}/sent/${recipientId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message request", error);
    throw error;
  }
};

export const getMessageBuddies = async (userId: number): Promise<MessageBuddyDTO[]> => {
  try {
    const response: AxiosResponse<MessageBuddyDTO[]> = await axios.get(
      `${API_BASE_URL}/buddies/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching message buddies", error);
    throw error;
  }
};

export const getChatMessages = async (
  userId: number,
  buddyId: number,
  lastMessageId?: string
): Promise<ChatMessage[]> => {
  try {
    const response: AxiosResponse<ChatMessage[]> = await axios.get(
      `${API_BASE_URL}/chat/${userId}/${buddyId}`,
      {
        params: {
          lastMessageId,
          limit: 50
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chat messages", error);
    throw error;
  }
};

export const sendMessage = async (
  senderId: number, 
  recipientId: number, 
  message: string
): Promise<ChatMessage> => {
  try {
    const response: AxiosResponse<ChatMessage> = await axios.post(
      `${API_BASE_URL}/send`, 
      {
        senderId,
        recipientId,
        message
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message", error);
    throw error;
  }
};