import SockJS from "sockjs-client";
import { Client, Frame, Message } from "@stomp/stompjs";

class ChatSocketService {
  private static instance: ChatSocketService;
  private stompClient: Client | null = null;
  private connected: boolean = false;

  private constructor() {}

  public static getInstance(): ChatSocketService {
    if (!ChatSocketService.instance) {
      ChatSocketService.instance = new ChatSocketService();
    }
    return ChatSocketService.instance;
  }

  /**
   * Connects to a buddy-specific chat channel.
   * The destination is set to `/topic/chat/{userId}-{buddyId}`.
   * 
   * @param userId Current user's ID.
   * @param buddyId Selected buddy's ID.
   * @param onMessageReceived Callback to process incoming messages.
   */
  public connect(userId: number, buddyId: number, onMessageReceived: (message: any) => void): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      debug: (msg: string) => console.log("[STOMP] " + msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 10000,
      onConnect: (frame: Frame) => {
        this.connected = true;
        console.log("Chat connected:", frame);
        if (this.stompClient) {
          const destination = `/topic/chat/${userId}-${buddyId}`;
          this.stompClient.subscribe(destination, (message: Message) => {
            if (message.body) {
              try {
                const payload = JSON.parse(message.body);
                onMessageReceived(payload);
              } catch (error) {
                console.error("Error parsing chat message:", error);
              }
            }
          });
        }
      },
      onStompError: (frame: Frame) => {
        console.error("Chat broker error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
      },
      onWebSocketClose: (evt) => {
        console.warn("WebSocket closed:", evt);
        this.connected = false;
      },
    });
    this.stompClient.activate();
  }

  /**
   * Sends a chat message to a specified destination.
   * 
   * @param destination The destination (e.g., `/app/chat/{userId}-{buddyId}`).
   * @param message The message payload.
   */
  public sendMessage(destination: string, message: any): void {
    if (this.stompClient && this.connected) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.error("Cannot send message, STOMP client is not connected.");
    }
  }

  /**
   * Disconnects the STOMP client.
   */
  public disconnect(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate().then(() => {
        console.log("Chat disconnected");
        this.connected = false;
      });
    }
  }
}

export default ChatSocketService.getInstance();
