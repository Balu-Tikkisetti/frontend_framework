// src/TopicsWorld.tsx
import { useState, useCallback } from "react";
import { MessageCircle, Info } from "lucide-react";
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

const COMPONENTS: Record<string, JSX.Element> = {
  Global: <Global />,
  Country: <Country />,
  Community: <Community />,
  TrendingTopics: <TrendingTopics />,
  Notifications: <Notifications />,
  Profile: <Profile />,
};

function TopicsWorld() {
  const [activeComponent, setActiveComponent] = useState<string>("Global");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const handleButtonClick = useCallback((componentName: string) => {
    setActiveComponent(componentName);
  }, []);

  return (
    <div className="container-fluid layout-container">
      {/* 🌟 Mobile Action Buttons */}
      <div className="d-md-none fixed-top d-flex justify-content-between p-3">
        <button
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="mobile-action-button"
          aria-label="Toggle Chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>

        <button
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          className="mobile-action-button"
          aria-label="Toggle Details"
        >
          <Info className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* 🌟 Three Column Responsive Layout */}
      <div className="row">
        {/* Left Column - Messages */}
        <aside className={`col-md-3 sidebar ${isChatOpen ? "d-block" : "d-none d-md-block"}`}>
          <Message />
        </aside>

        {/* Middle Column - Main Content */}
        <main className="col-md-6 main-container">
          <div className="main-content">{COMPONENTS[activeComponent]}</div>
          <div className="navigation-bar">
            <NavigationBar onButtonClick={handleButtonClick} />
          </div>
        </main>

        {/* Right Column - Details */}
        <aside className={`col-md-3 sidebar ${isDetailsOpen ? "d-block" : "d-none d-md-block"}`}>
          <Details />
        </aside>
      </div>
    </div>
  );
}

export default TopicsWorld;
