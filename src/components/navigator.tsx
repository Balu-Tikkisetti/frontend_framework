import React from "react";
import "../css/Navigator.css";
import { useParams } from "react-router-dom";

interface NavigationBarProps {
  onButtonClick: (componentName: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onButtonClick }) => {
  const { username } = useParams();

  return (
    <div className="navigation-bar position-absolute bottom-0 start-50 translate-middle-x">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      ></link>
      <button className="global-button n" onClick={() => onButtonClick("Global")}>
        <i className="bi bi-globe"></i> {/* Icon for Global Section */}
      </button>
      <button
        className="country-button n"
       
        onClick={() => onButtonClick("Country")}
      >
        <i className="bi bi-flag-fill"></i> {/* Icon for Country Section */}
      </button>
      <button
        className="community-button n"
        onClick={() => onButtonClick("Community")}
      >
        <i className="bi bi-people-fill"></i> {/* Icon for Community Section */}
      </button>
      <button
        className="trending-button n"
        onClick={() => onButtonClick("TrendingTopics")}
      >
        <i className="bi bi-graph-up-arrow"></i> {/* Icon for Trending Topics */}
      </button>
      <button
        className="notifications-button n position-relative"
        onClick={() => onButtonClick("Notifications")}
        type="button"
      >
        <i className="bi bi-bell"></i> {/* Icon for Notifications */}
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          0<span className="visually-hidden">unread messages</span>
        </span>
      </button>
      <button
        className="profile-button n"
        onClick={() => onButtonClick("Profile")}
      >
        <i className="bi bi-person-circle"></i> {/* Icon for Profile Section */}
      </button>
    </div>
  );
};

export default NavigationBar;
