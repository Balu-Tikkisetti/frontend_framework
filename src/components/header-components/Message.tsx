import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css"; 

interface User {
  id: number;
  name: string;
  isOnline: boolean;
  avatar: string;
}

interface Message {
  id: number;
  text: string;
  isSender: boolean;
  timestamp: string;
}

const Message = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey, how are you?", isSender: false, timestamp: "10:00 AM" },
    { id: 2, text: "I'm good, thanks! How about you?", isSender: true, timestamp: "10:02 AM" },
    { id: 3, text: "Just working on some new features", isSender: false, timestamp: "10:05 AM" }
  ]);
  
  const users: User[] = [
    { id: 1, name: "Desirae Schleifer", isOnline: false, avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Jocelyn Dias", isOnline: true, avatar: "/api/placeholder/40/40" },
    { id: 3, name: "Marilyn Franci", isOnline: true, avatar: "/api/placeholder/40/40" },
    { id: 4, name: "Nolan Dorwart", isOnline: false, avatar: "/api/placeholder/40/40" },
    { id: 5, name: "Kianna George", isOnline: false, avatar: "/api/placeholder/40/40" },
    { id: 6, name: "Helena Thortnot", isOnline: true, avatar: "/api/placeholder/40/40" },
    { id: 7, name: "Carla Westervelt", isOnline: false, avatar: "/api/placeholder/40/40" },
    { id: 8, name: "Jaydon Torff", isOnline: true, avatar: "/api/placeholder/40/40" },
    { id: 9, name: "Mira Curtis", isOnline: false, avatar: "/api/placeholder/40/40" },
    { id: 10, name: "Chance Septimus", isOnline: true, avatar: "/api/placeholder/40/40" },
    { id: 11, name: "Ashlynn Aminoff", isOnline: true, avatar: "/api/placeholder/40/40" }
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
      </div>

      {!selectedUser ? (
        // User List
        <div className="overflow-y-auto flex-1">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-medium text-gray-900">{user.name}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Chat Interface
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <button 
              onClick={() => setSelectedUser(null)}
              className="hover:bg-gray-100 p-1 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="relative">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-8 h-8 rounded-full"
              />
              {selectedUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <span className="text-sm font-medium">{selectedUser.name}</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.isSender 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className={`text-xs ${message.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;