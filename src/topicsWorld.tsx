import "./App.css";
import "./css/components.css";
import { useState } from "react";


import Global from "./components/Global.tsx";
import Country from "./components/Country.tsx";
import Community from "./components/Community.tsx";
import TrendingTopics from "./components/TrendingTopics.tsx";
import Notifications from "./components/Notifications.tsx";
import Profile from "./components/Profile.tsx";
import NavigationBar from "./components/Navigator.tsx";



function TopicsWorld() {
  const [activeComponent, setActiveComponent] = useState("Feeder");

  const handleButtonClick = (componentName: string) => {
    setActiveComponent(componentName);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "Global":
        return <Global />;
      case "Country":
        return <Country />;
      case "Community":
        return <Community/>
      case "TrendingTopics":
        return <TrendingTopics />;
      case "Notifications":
          return <Notifications />;
      case "Profile":
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="app-container " id="main">

        <div className="main-content ">{renderComponent()}</div>
        <div className="fixed-bottom">
          <NavigationBar onButtonClick={handleButtonClick} />
        </div>
      </div>
    </>
  );
}

export default TopicsWorld;
