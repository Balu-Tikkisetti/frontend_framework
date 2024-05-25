import "./App.css";
import "./components.css";
import React, { useState } from "react";
import Feeder from "./components/feeder_section.tsx";
import Random from "./components/Random.tsx";
import NavigationBar from "./components/navigator.tsx";
import Postings from "./components/posting_section.tsx";
import Profile from "./components/Profile.tsx";
import Search from "./components/Search.tsx";
import Notification_section from "./components/notification_section.tsx";

function CollegeMedia() {
  const [activeComponent, setActiveComponent] = useState("Feeder");

  const handleButtonClick = (componentName: string) => {
    setActiveComponent(componentName);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "Feeder":
        return <Feeder />;
      case "Subscribed":
        return <Random />;
      case "Search":
        return <Search/>
      case "Postings":
        return <Postings />;
      case "Profile":
        return <Profile />;
      case "Notification_section":
        return <Notification_section />;

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

export default CollegeMedia;
