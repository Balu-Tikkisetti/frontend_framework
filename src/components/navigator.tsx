import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Users, 
  TrendingUp, 
  Bell, 
  User 
} from 'lucide-react';

interface NavigationBarProps {
  onButtonClick: (componentName: string) => void;
  isHidden?: boolean;
}

const Navigator: React.FC<NavigationBarProps> = ({ 
  onButtonClick, 
  isHidden = false
}) => {
 
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const navButtons = [
    { 
      icon: Globe, 
      name: "Global", 
      onClick: () => {
        onButtonClick("Global");
        setActiveButton("Global");
      }
    },
    { 
      icon: MapPin, 
      name: "Country", 
      onClick: () => {
        onButtonClick("Country");
        setActiveButton("Country");
      }
    },
    { 
      icon: Users, 
      name: "Community", 
      onClick: () => {
        onButtonClick("Community");
        setActiveButton("Community");
      }
    },
    { 
      icon: TrendingUp, 
      name: "TrendingTopics", 
      onClick: () => {
        onButtonClick("TrendingTopics");
        setActiveButton("TrendingTopics");
      }
    },
    { 
      icon: Bell, 
      name: "Notifications", 
      onClick: () => {
        onButtonClick("Notifications");
        setActiveButton("Notifications");
      },
      badge: 0
    },
    { 
      icon: User, 
      name: "Profile", 
      onClick: () => {
        onButtonClick("Profile");
        setActiveButton("Profile");
      }
    }
  ];

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 w-full z-50 
        bg-gradient-to-r from-sky-500 to-blue-600 
        shadow-xl rounded-t-xl
        transition-transform duration-300 ease-in-out
        ${isHidden ? 'translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="flex justify-around items-center py-2 px-4 w-full">
        {navButtons.map((button) => (
          <button
            key={button.name}
            onClick={button.onClick}
            className={`
              relative flex flex-col items-center justify-center 
              text-white transition duration-300 transform 
              hover:scale-110 hover:text-gray-100
              ${activeButton === button.name ? 'text-white/90 scale-110' : 'text-white/70'}
              p-1 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-300/50
            `}
          >
            <button.icon 
              className={`
                h-5 w-5
                ${activeButton === button.name ? 'opacity-100' : 'opacity-80'}
              `}
            />
            
            {button.badge !== undefined && button.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full 
                w-4 h-4 flex items-center justify-center text-[8px] font-bold">
                {button.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigator;