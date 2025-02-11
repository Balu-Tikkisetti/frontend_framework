// src/controller/NotificationController.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/notifications";

export const fetchNotifications = async (userId: number, page: number = 0, size: number = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: { page, size, userId }
    });
    return response.data.content; // Adjust based on your Page<NotificationDTO> structure
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
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/message-request/${notificationId}`,
        { accept, senderId, recipientId }
      );
      return response.data;
    } catch (error) {
      console.error("Error responding to message request", error);
      throw error;
    }
  };

export const getUnreadNotificationsCount = async (userId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/unread/count`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notifications count", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: number) => {
  try {
    // Call the endpoint /api/notifications/read-all and pass userId as a query parameter.
    const response = await axios.put(`${API_BASE_URL}/read-all`, null, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read", error);
    throw error;
  }
};
