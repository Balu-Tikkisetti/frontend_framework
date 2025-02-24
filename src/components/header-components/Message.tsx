import React, { useState, useEffect } from 'react';
import { MoreVertical, Search, Lock } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from '../../context/AuthContext';
import { 
  getMessageBuddies, 
  MessageBuddyDTO 
} from '../../controller/MessageController';
import "../../css/Message.css";
import profilePic from "../../assets/unisex-profile-pic.png";

interface MessageProps {
  onBuddySelect: (buddy: MessageBuddyDTO) => void;
}

const Message: React.FC<MessageProps> = ({ onBuddySelect }) => {
  const { userId } = useAuth();
  const [messageBuddies, setMessageBuddies] = useState<MessageBuddyDTO[]>([]);
  const [privateBuddies, setPrivateBuddies] = useState<MessageBuddyDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'General' | 'Private'>('General');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch message buddies
  useEffect(() => {
    const fetchMessageBuddies = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const buddies = await getMessageBuddies(userId);
        setMessageBuddies(buddies);
        
        // Placeholder for future private buddies
        // This could be fetched from a different API or filtered differently
        const mockPrivateBuddies = buddies.slice(0, 2).map(buddy => ({
          ...buddy,
          isPrivate: true
        }));
        setPrivateBuddies(mockPrivateBuddies);
      } catch (err) {
        setError('Failed to load message buddies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessageBuddies();
  }, [userId]);

  // Filter buddies based on search term and active tab
  const filteredBuddies = (activeTab === 'General' ? messageBuddies : privateBuddies)
    .filter(buddy => 
      buddy.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Render loading state
  if (loading) {
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
    <div className="message-container">
      <div className="message-sidebar">
        <div className="message-sidebar-header">
          <div className="flex w-full justify-between items-center">
            <button 
              className={`flex-1 text-sm font-semibold pb-2 text-center ${activeTab === 'General' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('General')}
            >
              General <span className="ml-1 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">{messageBuddies.length}</span>
            </button>
            <button 
              className={`flex-1 text-sm font-semibold pb-2 text-center ${activeTab === 'Private' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('Private')}
            >
              <div className="flex items-center justify-center">
                <Lock size={14} className="mr-1" />
                Private <span className="ml-1 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">{privateBuddies.length}</span>
              </div>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search chat" 
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Buddy List */}
        <div className="message-buddy-list">
          {filteredBuddies.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              {activeTab === 'General' 
                ? 'No message buddies found' 
                : 'No private chats available'}
            </div>
          ) : (
            filteredBuddies.map((buddy) => (
              <BuddyListItem 
                key={buddy.userId} 
                buddy={buddy}
                onSelect={onBuddySelect}
                isPrivate={activeTab === 'Private'}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Buddy List Item Component
const BuddyListItem: React.FC<{
  buddy: MessageBuddyDTO;
  onSelect: (buddy: MessageBuddyDTO) => void;
  isPrivate?: boolean;
}> = ({ buddy, onSelect, isPrivate = false }) => (
  <div 
    className="message-buddy-item group"
    onClick={() => onSelect(buddy)}
  >
    <div className="message-buddy-avatar">
      <img
        src={profilePic}
        alt=""
      />
      {buddy.isOnline && <div className="online-indicator" />}
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-semibold">{buddy.username}</span>
          {isPrivate && (
            <Lock 
              size={12} 
              className="ml-2 text-gray-500 group-hover:text-primary" 
            />
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(buddy.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-sm text-gray-500 truncate flex-grow">
          {buddy.isTyping ? `${buddy.username} is typing...` : buddy.lastMessage}
        </p>
        {buddy.unreadCount > 0 && (
          <span className="unread-badge">{buddy.unreadCount}</span>
        )}
      </div>
    </div>
  </div>
);

export default Message;