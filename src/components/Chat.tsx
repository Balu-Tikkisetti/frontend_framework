import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Send, X, Paperclip, Smile, MoreVertical } from "lucide-react";
import "../css/Chat.css";
import profilePic from "../assets/unisex-profile-pic.png";
import ChatSocketService from "../services/ChatSocketService";

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type?: "text" | "system";
}

interface ChatProps {
  buddy: {
    id: string;
    username: string;
    avatar?: string;
    status?: "online" | "offline" | "away";
  } | null;
  userId: number;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ buddy, userId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (buddy) {
      ChatSocketService.connect(userId, Number(buddy.id), (incomingMsg: any) => {
        const parsedMessage: ChatMessage = {
          ...incomingMsg,
          timestamp: new Date(incomingMsg.timestamp),
          type: incomingMsg.type as "text" | "system"  // Ensure correct type
        };
        setMessages(prev => [...prev, parsedMessage]);
      });
    }
    return () => {
      ChatSocketService.disconnect();
    };
  }, [buddy, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && buddy) {
      const messagePayload: ChatMessage = {  // Explicitly type the payload
        id: Date.now().toString(),
        sender: "You",
        content: newMessage,
        timestamp: new Date(),
        type: "text"
      };

      const destination = `/app/chat/${userId}-${buddy.id}`;
      ChatSocketService.sendMessage(destination, messagePayload);

      // Now the types match exactly
      setMessages(prev => [...prev, messagePayload]);
      setNewMessage("");
    }
  };

  const handleTyping = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.type === "system") {
      return (
        <div className="text-center text-muted small py-2">
          {message.content}
        </div>
      );
    }
    return <div className="message-text">{message.content}</div>;
  };

  if (!buddy) return null;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar-wrapper">
            <img src={profilePic} alt="Avatar" className="chat-avatar" />
            <span
              className={`chat-status-indicator ${
                buddy.status === "online"
                  ? "online"
                  : buddy.status === "away"
                  ? "away"
                  : "offline"
              }`}
            />
          </div>
          <div className="chat-user-details">
            <div className="chat-username">{buddy.username}</div>
            <div className="chat-user-status">
              {buddy.status === "online"
                ? "Active now"
                : buddy.status === "away"
                ? "Away"
                : "Offline"}
            </div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn">
            <MoreVertical size={20} />
          </button>
          <button onClick={onClose} className="chat-action-btn">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="chat-messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-wrapper ${
              message.sender === "You" ? "sent" : "received"
            }`}
          >
            <div
              className={`message-content ${
                message.sender === "You" ? "sent-message" : "received-message"
              }`}
            >
              {renderMessageContent(message)}
              <div
                className={`message-timestamp ${
                  message.sender === "You" ? "sent-timestamp" : "received-timestamp"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-actions">
          <button className="chat-input-action-btn">
            <Paperclip size={20} />
          </button>
          <button className="chat-input-action-btn">
            <Smile size={20} />
          </button>
          <div className="chat-textarea-wrapper">
            <textarea
              ref={inputRef}
              rows={1}
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="chat-textarea"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="chat-send-btn"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;