// src/components/Notifications.tsx
import React, { useEffect, useState } from "react";
import { 
  fetchNotifications, 
  respondToMessageRequest,
  getUnreadNotificationsCount
} from "../controller/NotificationController";
import "../css/Notifications.css";
import NotificationSocketService from "../services/NotificationSocketService";
import { useAuth } from "../context/AuthContext";

export interface Notification {
  id: number;
  type: "MESSAGE_REQUEST" | "UPVOTE" | "OPINION" | "OTHERS";
  senderId: number;
  recipientId: number;
  message: string;
  status: "READ" | "UNREAD";
  timestamp: string;
  referenceId?: number;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const { userId } = useAuth();

  // Fetch initial notifications and unread count
  const loadNotifications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const initialNotifications = await fetchNotifications(userId, page);
      setNotifications(initialNotifications);

      // Fetch unread count
      const count = await getUnreadNotificationsCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId, page]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (userId) {
      try {
        NotificationSocketService.connect(userId, (notification) => {
          setNotifications((prev) => [notification, ...prev]);
          // Increment unread count for new notifications
          setUnreadCount((prev) => prev + 1);
        });
      } catch (err) {
        console.error("WebSocket connection error", err);
      }

      return () => {
        NotificationSocketService.disconnect();
      };
    }
  }, [userId]);

  const handleResponse = async (notification: Notification, accept: boolean) => {
    try {
      await respondToMessageRequest(
        notification.id.toString(),
        accept,
        notification.senderId,
        notification.recipientId
      );
      
      // Remove the notification and decrease unread count
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to respond to message request", err);
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <div className="unread-count">
          Unread: {unreadCount}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">No notifications available</div>
      ) : (
        notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-card ${notification.status === 'UNREAD' ? 'unread' : ''}`}
          >
            <div className="notification-header">
              <span className="notification-type">{notification.type}</span>
              <span className="notification-timestamp">{notification.timestamp}</span>
            </div>
            <div className="notification-body">
              <p>{notification.message}</p>
            </div>
            {notification.type === "MESSAGE_REQUEST" && (
              <div className="notification-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleResponse(notification, true)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleResponse(notification, false)}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <div className="notifications-pagination">
        <button 
          disabled={page === 0}
          onClick={() => setPage(prev => Math.max(0, prev - 1))}
        >
          Previous
        </button>
        <button 
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Notifications;