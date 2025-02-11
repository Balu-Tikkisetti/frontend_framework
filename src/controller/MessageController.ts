// src/controller/MessageController.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/message';

// Updated interface to match backend MessageBuddyDTO
export interface MessageBuddyDTO {
  userId: number;
  username: string;
  profilePicture: string; // Base64 encoded image string
  isOnline: boolean;
  status: string;
  lastMessage: string;
  lastMessageTimestamp: string; // Assuming ISO date string from LocalDateTime
  unreadCount: number;
}

export const sendMessageRequest = async (senderId: number, recipientId: number) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/message-request/${senderId}/sent/${recipientId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message request', error);
    throw error;
  }
};

export const getMessageBuddies = async (userId: number): Promise<MessageBuddyDTO[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/buddies/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching message buddies', error);
    throw error;
  }
};

export const getChatMessages = async (
    userId: number, 
    buddyId: number, 
    lastMessageId?: string
  ) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${userId}/${buddyId}`, {
        params: {
          lastMessageId,
          limit: 50 // Number of messages to fetch
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages', error);
      throw error;
    }
  };

export const sendMessage = async (senderId: number, recipientId: number, message: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send`, {
      senderId,
      recipientId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message', error);
    throw error;
  }
};
