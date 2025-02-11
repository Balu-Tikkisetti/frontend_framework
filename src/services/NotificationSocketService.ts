// src/services/NotificationSocketService.ts
import SockJS from 'sockjs-client';
import { Client, Frame, Message } from '@stomp/stompjs';

class NotificationSocketService {
  private static instance: NotificationSocketService;
  private stompClient: Client | null = null;
  private connected: boolean = false;

  private constructor() {}

  public static getInstance(): NotificationSocketService {
    if (!NotificationSocketService.instance) {
      NotificationSocketService.instance = new NotificationSocketService();
    }
    return NotificationSocketService.instance;
  }

  public connect(recipientId: number, onNotification: (notification: any) => void): void {
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
      console.log('Connected: ' + frame);
      
      if (this.stompClient) {
        const destination = `/topic/notifications/${recipientId}`;
        this.stompClient.subscribe(destination, (message: Message) => {
          if (message.body) {
            try {
              const payload = JSON.parse(message.body);
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
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.activate();
  }

  public disconnect(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate().then(() => {
        console.log('Disconnected from WebSocket');
        this.connected = false;
      });
    }
  }
}

export default NotificationSocketService.getInstance();