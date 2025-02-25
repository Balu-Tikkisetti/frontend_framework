// src/controller/NotificationController.ts
import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8080/api/notifications";

// Define interfaces for your DTOs
export interface NotificationDTO {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  read: boolean;
  // Add other properties as needed
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  // Add other pagination-related properties
}

export const fetchNotifications = async (
  userId: number, 
  page = 0, 
  size = 10
): Promise<NotificationDTO[]> => {
  try {
    const response: AxiosResponse<PagedResponse<NotificationDTO>> = await axios.get(
      `${API_BASE_URL}`, 
      {
        params: { page, size, userId }
      }
    );
    return response.data.content;
  } catch (error) {
    console.error("Error fetching notifications", error);
    throw error;
  }
};

export const respondToMessageRequest = async (
  notificationId: string,
  accept: boolean,
  senderId: number,
  recipientId: number
): Promise<unknown> => {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/message-request/${notificationId}`,
      { accept, senderId, recipientId }
    );
    return response.data;
  } catch (error) {
    console.error("Error responding to message request", error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (
  userId: number
): Promise<number> => {
  try {
    const response: AxiosResponse<number> = await axios.get(
      `${API_BASE_URL}/unread/count`, 
      {
        params: { userId }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notifications count", error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<unknown> => {
  try {
    const response: AxiosResponse = await axios.put(
      `${API_BASE_URL}/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  userId: number
): Promise<unknown> => {
  try {
    const response: AxiosResponse = await axios.put(
      `${API_BASE_URL}/read-all`, 
      null, 
      {
        params: { userId }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read", error);
    throw error;
  }
};