import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from '../../context/AuthContext';
import { 
  getMessageBuddies, 
  getChatMessages, 
  sendMessage, 
  MessageBuddyDTO 
} from '../../controller/MessageController';
import "../../css/Message.css"

interface ChatMessage {
  id: string;
  text: string;
  senderId: number;
  recipientId: number;
  timestamp: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
}

const Message: React.FC = () => {
  const { userId } = useAuth();
  const [messageBuddies, setMessageBuddies] = useState<MessageBuddyDTO[]>([]);
  const [selectedBuddy, setSelectedBuddy] = useState<MessageBuddyDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch message buddies
  useEffect(() => {
    const fetchMessageBuddies = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const buddies = await getMessageBuddies(userId);
        setMessageBuddies(buddies);
      } catch (err) {
        setError('Failed to load message buddies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessageBuddies();
  }, [userId]);

  // Fetch chat messages with infinite scroll
  const fetchChatMessages = useCallback(async (lastMessageId?: string) => {
    if (!userId || !selectedBuddy) return;
    try {
      setLoading(true);
      const chatMessages = await getChatMessages(
        userId, 
        selectedBuddy.userId, 
        lastMessageId
      );

      // Update messages and check if there are more
      setMessages(prev => 
        lastMessageId 
          ? [...chatMessages, ...prev] 
          : chatMessages
      );
      setHasMore(chatMessages.length === 50); // Assuming 50 is the limit
    } catch (err) {
      setError('Failed to load chat messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedBuddy]);

  // Initial chat messages load
  useEffect(() => {
    if (selectedBuddy) {
      fetchChatMessages();
    }
  }, [selectedBuddy, fetchChatMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !selectedBuddy) return;
    try {
      await sendMessage(userId, selectedBuddy.userId, newMessage.trim());
      
      const sentMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        text: newMessage.trim(),
        senderId: userId,
        recipientId: selectedBuddy.userId,
        timestamp: new Date().toISOString(),
        status: 'SENT'
      };

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    const container = messageContainerRef.current;
    if (!container || !hasMore) return;

    if (container.scrollTop === 0) {
      const oldestMessageId = messages[0]?.id;
      fetchChatMessages(oldestMessageId);
    }
  }, [fetchChatMessages, hasMore, messages]);

  // Render loading state
  if (loading && (!selectedBuddy || messages.length === 0)) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-4 border-end h-100 d-flex flex-column">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Messages</h5>
            <button className="btn btn-outline-secondary btn-sm">
              <MoreVertical size={18} />
            </button>
          </div>

          <div className="overflow-auto flex-grow-1">
            {messageBuddies.length === 0 ? (
              <div className="text-center text-muted p-4">
                No message buddies found
              </div>
            ) : (
              messageBuddies.map((buddy) => (
                <BuddyListItem 
                  key={buddy.userId} 
                  buddy={buddy} 
                  isSelected={selectedBuddy?.userId === buddy.userId}
                  onSelect={() => setSelectedBuddy(buddy)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedBuddy ? (
          <div className="col-8 h-100 d-flex flex-column">
            {/* Chat Header */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-outline-secondary me-3 d-md-none"
                  onClick={() => setSelectedBuddy(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="position-relative me-3">
                  <img
                    src={selectedBuddy.profilePicture}
                    alt={selectedBuddy.username}
                    className="rounded-circle"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  {selectedBuddy.isOnline && (
                    <span className="position-absolute bottom-0 end-0 p-1 bg-success rounded-circle border border-white"></span>
                  )}
                </div>
                <div>
                  <h6 className="mb-1">{selectedBuddy.username}</h6>
                  <small className="text-muted">
                    {selectedBuddy.isOnline ? 'Online' : 'Offline'}
                  </small>
                </div>
              </div>
              <button className="btn btn-outline-secondary">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={messageContainerRef}
              onScroll={handleScroll}
              className="flex-grow-1 overflow-auto p-3 bg-light"
            >
              {loading && hasMore && (
                <div className="text-center text-muted">Loading more...</div>
              )}

              {messages.map((msg) => (
                <MessageItem 
                  key={msg.id} 
                  message={msg} 
                  isCurrentUser={msg.senderId === userId} 
                />
              ))}
              <div ref={messageEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-top bg-white">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-8 d-flex justify-content-center align-items-center text-muted">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

// Buddy List Item Component
const BuddyListItem: React.FC<{
  buddy: MessageBuddyDTO;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ buddy, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`d-flex align-items-center p-3 border-bottom cursor-pointer ${isSelected ? 'bg-light' : 'hover-bg-light'}`}
  >
    <div className="position-relative me-3">
      <img
        src={buddy.profilePicture}
        alt={buddy.username}
        className="rounded-circle"
        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
      />
      {buddy.isOnline && (
        <span className="position-absolute bottom-0 end-0 p-1 bg-success rounded-circle border border-white"></span>
      )}
    </div>
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-1">{buddy.username}</h6>
        {buddy.unreadCount && buddy.unreadCount > 0 && (
          <span className="badge bg-danger">{buddy.unreadCount}</span>
        )}
      </div>
      {buddy.lastMessage && (
        <p className="text-muted mb-0 text-truncate">
          {buddy.lastMessage}
        </p>
      )}
    </div>
  </div>
);

// Message Item Component
const MessageItem: React.FC<{
  message: ChatMessage;
  isCurrentUser: boolean;
}> = ({ message, isCurrentUser }) => (
  <div className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
    <div 
      className={`p-2 rounded ${
        isCurrentUser 
          ? 'bg-primary text-white' 
          : 'bg-light text-dark'
      }`}
      style={{ maxWidth: '75%' }}
    >
      <p className="mb-1">{message.text}</p>
      <small className={`d-block text-right ${isCurrentUser ? 'text-white-50' : 'text-muted'}`}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </small>
      {isCurrentUser && message.status && (
        <div className="small opacity-50 text-right">
          {message.status === 'SENT' && '✓'}
          {message.status === 'DELIVERED' && '✓✓'}
          {message.status === 'READ' && '✓✓'}
        </div>
      )}
    </div>
  </div>
);

export default Message;