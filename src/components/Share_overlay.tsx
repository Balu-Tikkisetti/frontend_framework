// ShareOverlay.tsx

import React, { CSSProperties, RefObject, useState } from "react";
import axios from "axios";
import { api } from "../model/constants";
import { useParams } from "wouter";
import "../search.css";

interface ShareOverlayProps {
  onClose: () => void;

  post_id: string;
  user_id: string; // Add post_id prop
}

interface UserDetails {
  user_id: string;
  username: string;
  profile_pic: Blob;
}

const ShareOverlay: React.FC<ShareOverlayProps> = ({
  onClose,
  
  post_id,
  user_id,
}) => {
  const overlayStyle: CSSProperties = {
    position: "absolute",
    zIndex: 999,
  };

  const [userDetails, setUserDetails] = useState<UserDetails[] | null>(null);

  const handleSearch = async () => {
    const searchUserWord =
      document.querySelector<HTMLInputElement>(".search-input")?.value;
    try {
      const userReponse = await axios.get(
        `${api}/searchUsers/${searchUserWord}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setUserDetails(userReponse.data);
    } catch (e) {
      alert("Got error while fetching the user details " + e);
    }
  };

  const handleUserShare = async (
    recieving_user_id: string,
    user_id: string
  ) => {
    try {
      const timestamp = new Date().toLocaleString();

      const formData = new FormData();
      formData.append("post_id",post_id);
      formData.append("user_id",user_id);
      formData.append("timestamp",timestamp)
      formData.append("recieving_user_id",recieving_user_id);
     
 const response = await axios.post(`${api}/sendNotification`, formData);
      onClose();
      console.log(response.data);
    } catch (e) {
      alert("Error while sending the post notification " + e);
    }
  };

  return (
    <div className="overlay-container" style={overlayStyle}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      ></link>
      <div className="overlay">
        <div className="overlay-content">
          <input type="text" placeholder="Search..." className="search-input" />
          <button onClick={onClose}>
            <i className="bi bi-x-circle-fill"></i>
          </button>
          <button onClick={handleSearch}>
            <i className="bi bi-search"></i>
          </button>
        </div>
        {userDetails &&
          userDetails.map(
            (user, index) =>
              user.user_id !== user_id && (
                <button
                  key={index}
                  className="user-details-share btn border border-5 rounded"
                  onClick={() => {
                    handleUserShare(user.user_id, user_id);
                  }}
                >
                  {user.profile_pic != null ? (
                    <img
                      src={`data:image;base64,${user.profile_pic}`}
                      alt=""
                      className="pic_icon"
                    />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                  <p>{user.username}</p>
                </button>
              )
          )}
      </div>
    </div>
  );
};

export default ShareOverlay;
