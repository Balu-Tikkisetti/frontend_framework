// src/components/Notifications.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  fetchNotifications, 
  respondToMessageRequest,
  getUnreadNotificationsCount 
} from '../controller/NotificationController';
import NotificationSocketService from '../services/NotificationSocketService';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import '../css/Notifications.css';

const ITEMS_PER_PAGE = 10;

interface Notification {
  id: number;
  type: "MESSAGE_REQUEST" | "UPVOTE" | "OPINION" | "OTHERS";
  senderId: number;
  recipientId: number;
  message: string;
  status: "READ" | "UNREAD";
  timestamp: string;
  referenceId?: number;
  // Additional properties with better typing
  [key: string]: unknown;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const { userId } = useAuth();
  
  // Ref for intersection observer
  const observer = useRef<IntersectionObserver>();
  const lastNotificationRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch notifications with pagination
  const loadNotifications = useCallback(async (pageNum: number) => {
    if (!userId || !hasMore) return;

    try {
      setLoading(true);
      const newNotifications = await fetchNotifications(userId, pageNum) as unknown as Notification[];
      
      setNotifications(prev => {
        if (pageNum === 0) return newNotifications;
        return [...prev, ...newNotifications];
      });
      
      setHasMore(newNotifications.length === ITEMS_PER_PAGE);

      // Only fetch unread count on initial load
      if (pageNum === 0) {
        const count = await getUnreadNotificationsCount(userId) as number;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, hasMore]);

  // Initial load and pagination
  useEffect(() => {
    void loadNotifications(page);
  }, [userId, page, loadNotifications]);

  // WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    try {
      NotificationSocketService.connect(userId, handleNewNotification);
    } catch (err) {
      console.error('WebSocket connection error', err);
    }

    return () => {
      NotificationSocketService.disconnect();
    };
  }, [userId]);

  const handleResponse = async (notification: Notification, accept: boolean) => {
    try {
      await respondToMessageRequest(
        notification.id.toString(),
        accept,
        notification.senderId,
        notification.recipientId
      );
      
      // Remove the notification and update unread count
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      if (notification.status === 'UNREAD') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to respond to message request', err);
    }
  };

  // Wrapper functions for event handlers that don't return promises
  const handleAccept = (notification: Notification) => {
    void handleResponse(notification, true);
  };

  const handleDecline = (notification: Notification) => {
    void handleResponse(notification, false);
  };

  const formatTimestamp = (timestamp: string): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

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
        {unreadCount > 0 && (
          <div className="unread-badge">
            {unreadCount} unread
          </div>
        )}
      </div>

      <div className="notifications-scroll">
        {notifications.length === 0 && !loading ? (
          <div className="no-notifications">
            No notifications available
          </div>
        ) : (
          notifications.map((notification, index) => {
            const isLastElement = index === notifications.length - 1;
            
            return (
              <div 
                key={notification.id}
                ref={isLastElement ? lastNotificationRef : null}
                className={`notification-card ${notification.status === 'UNREAD' ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-type">
                      {notification.type.replace('_', ' ')}
                    </span>
                    <span className="notification-timestamp">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.type === "MESSAGE_REQUEST" && (
                    <div className="notification-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(notification)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => handleDecline(notification)}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;