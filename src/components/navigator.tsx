// NavigationBar.tsx

import React, { useEffect, useState } from "react";
import "../App.css";

import axios from "axios";
import { api } from "../model/constants";
import { useParams, useNavigate } from "react-router-dom";

interface NavigationBarProps {
  onButtonClick: (componentName: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onButtonClick }) => {
  const { user_id } = useParams();

  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`${api}/getDp/${user_id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setProfilePic(response.data);
        
      } catch (e) {
        alert("error while loading the profile picture " + e);
      }
    };
    if (user_id) {
      fetchProfilePic();
    }
  }, [user_id]);

  return (
    <div className="navigation-bar position-absolute bottom-0 start-50 translate-middle-x">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      ></link>
      <button className="f-button n" onClick={() => onButtonClick("Feeder")}>
        <i className="bi bi-house-door-fill"></i>
      </button>
      <button
        className="love-button n"
        onClick={() => onButtonClick("Subscribed")}
      >
       <i className="bi bi-compass-fill"></i>
      </button>
      <button
        className="search-button n"
        onClick={() => onButtonClick("Search")}
      >
        <i className="bi bi-search"></i>
      </button>
      <button
        className="plus-button n "
        onClick={() => onButtonClick("Postings")}
      >
        <i className="bi bi-cloud-arrow-up-fill"></i>
      </button>
      <button
        className="Notification_button n position-relative"
        onClick={() => onButtonClick("Notification_section")}
        type="button"
      >
        <i className="bi bi-bell-fill"></i>
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          0<span className="visually-hidden">unread messages</span>
        </span>
      </button>
      <button
        className="profile-button n"
        onClick={() => onButtonClick("Profile")}
      >
        <div>
          {profilePic != null && profilePic !== "" ? (
            <img src={`data:image;base64,${profilePic}`} alt="" className="pic_icon" />
          ) : (
            <i className="bi bi-person-fill"></i>
          )}

        </div>
      </button>
    </div>
  );
};

export default NavigationBar;
