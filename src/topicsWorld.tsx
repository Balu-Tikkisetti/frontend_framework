// src/TopicsWorld.tsx
import React, { useState, useCallback } from "react";
import { MessageCircle, Info, X } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";

import Global from "./components/Global";
import Country from "./components/Country";
import Community from "./components/Community";
import TrendingTopics from "./components/TrendingTopics";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import NavigationBar from "./components/Navigator";
import Message from "./components/header-components/Message";
import Details from "./components/header-components/Details";
import Chat from "./components/Chat";
import { MessageBuddyDTO } from "./controller/MessageController";

const COMPONENTS: Record<string, React.ComponentType<any>> = {
  Global,
  Country,
  Community,
  TrendingTopics,
  Notifications,
  Profile,
  Chat,
};

const TopicsWorld: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>("Global");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedBuddy, setSelectedBuddy] = useState<MessageBuddyDTO | null>(null);

  const handleButtonClick = useCallback((componentName: string) => {
    setActiveComponent(componentName);
  }, []);

  const handleBuddySelect = useCallback((buddy: MessageBuddyDTO) => {
    setSelectedBuddy(buddy);
    setActiveComponent("Chat");
    setIsChatOpen(false);
  }, []);

  const handleCloseChat = useCallback(() => {
    setSelectedBuddy(null);
    setActiveComponent("Global");
  }, []);

  const closeSidebars = useCallback(() => {
    setIsChatOpen(false);
    setIsDetailsOpen(false);
  }, []);

  const ActiveComponent = COMPONENTS[activeComponent];

  return (
    <div className="min-h-screen bg-gradient-custom overflow-hidden relative">
      {/* Mobile Action Buttons */}
      <div className="fixed top-4 right-4 flex space-x-2 md:hidden z-50">
        <button
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle Chat"
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
        <button
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle Details"
        >
          {isDetailsOpen ? <X size={24} /> : <Info size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {(isChatOpen || isDetailsOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebars}
        />
      )}

      {/* Desktop Layout Using CSS Grid */}
      <div className="hidden md:grid grid-cols-4 h-screen w-screen">
        {/* Left Sidebar (Desktop) */}
        <aside className="col-span-1 bg-white custom-shadow overflow-y-auto scrollbar-thin">
          <Message onBuddySelect={handleBuddySelect} />
        </aside>

        {/* Main Content (Desktop) */}
        <main className="col-span-2 flex flex-col bg-white">
          <div className="flex-grow overflow-y-auto p-2 scrollbar-thin">
            <ActiveComponent buddy={selectedBuddy} onClose={handleCloseChat} />
          </div>
          <div className="w-full">

              <NavigationBar 
                onButtonClick={handleButtonClick} 
                isHidden={selectedBuddy !== null}
              />
      
          </div>
        </main>

        {/* Right Sidebar (Desktop) */}
        <aside className="col-span-1 bg-white custom-shadow overflow-y-auto scrollbar-thin">
          <Details />
        </aside>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="w-full flex flex-col h-screen bg-white">
          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin">
            <ActiveComponent buddy={selectedBuddy} onClose={handleCloseChat} />
          </div>
          <div className="w-full">
  
              <NavigationBar 
                onButtonClick={handleButtonClick} 
                isHidden={selectedBuddy !== null}
              />
       
          </div>
        </main>

        {/* Mobile Left Sidebar */}
        <aside
          className={`
            w-3/4 bg-white custom-shadow sidebar-transition scrollbar-thin 
            fixed top-0 left-0 h-full z-40 overflow-y-auto
            ${isChatOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Message onBuddySelect={handleBuddySelect} />
        </aside>

        {/* Mobile Right Sidebar */}
        <aside
          className={`
            w-3/4 bg-white custom-shadow sidebar-transition scrollbar-thin 
            fixed top-0 right-0 h-full z-40 overflow-y-auto
            ${isDetailsOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <Details />
        </aside>
      </div>
    </div>
  );
};

export default TopicsWorld;