// src/services/NotificationSocketService.ts
import SockJS from 'sockjs-client';
import { Client, Frame, Message } from '@stomp/stompjs';



interface Notification {
  id: number;
  type: "MESSAGE_REQUEST" | "UPVOTE" | "OPINION" | "OTHERS";
  senderId: number;
  recipientId: number;
  message: string;
  status: "READ" | "UNREAD";
  timestamp: string;
  referenceId?: number;
  // Allow additional properties
  [key: string]: unknown;
}

class NotificationSocketService {
  private static instance: NotificationSocketService;
  private stompClient: Client | null = null;
  private connected = false;

  // Empty constructor is fine for singleton pattern
  private constructor() {
    // Intentionally empty
  }

  public static getInstance(): NotificationSocketService {
    if (!NotificationSocketService.instance) {
      NotificationSocketService.instance = new NotificationSocketService();
    }
    return NotificationSocketService.instance;
  }

  public connect(recipientId: number, onNotification: (notification: Notification) => void): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 10000,
    });

    this.stompClient.onConnect = (frame: Frame) => {
      this.connected = true;
      console.log(`Connected: ${frame.command}`);
      
      if (this.stompClient) {
        const destination = `/topic/notifications/${recipientId}`;
        this.stompClient.subscribe(destination, (message: Message) => {
          if (message.body) {
            try {
              const payload = JSON.parse(message.body) as Notification;
              onNotification(payload);
            } catch (error) {
              console.error('Error parsing notification message:', error);
            }
          }
        });
      }
    };

    this.stompClient.onDisconnect = () => {
      console.log('Disconnected!');
      this.connected = false;
    };

    this.stompClient.onStompError = (frame) => {
      console.error(`Broker reported error: ${frame.headers.message}`);
      console.error(`Additional details: ${frame.body}`);
    };

    this.stompClient.activate();
  }

  public disconnect(): void {
    if (this.stompClient && this.connected) {
      // Handle Promise properly with void operator
      void this.stompClient.deactivate().then(() => {
        console.log('Disconnected from WebSocket');
        this.connected = false;
      });
    }
  }
}

export default NotificationSocketService.getInstance();