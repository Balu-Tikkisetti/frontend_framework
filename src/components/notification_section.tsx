import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../model/constants";
import "../search.css"
import "../components.css"
import "../App.css"

interface Notifications{
  post_id:string;
  user_id:string;
  username:string;
  profile_pic:Blob;
  post_image:Blob;
}



function Notification_section() {
const [notifications, setNotifications]=useState<Notifications[]|null>(null);

const { user_id } = useParams();
const navigate = useNavigate();

const handlePostClick=(post_id:string)=>{
   navigate(`notificationpost/${user_id}/${post_id}`);
}

useEffect(()=>{

  const fetchNotifications=async()=>{
    
    try{
       const response=await axios.get(`${api}/getNotifications/${user_id}`,{
        headers:{
          "Content-Type":"application/json"
        },
       });
       setNotifications(response.data);
    }catch(e){
      alert("Error while fetching the notifications "+e);
    }
  }
  if(user_id){
    fetchNotifications()
  }
},[user_id])

if (!notifications) {
  return (
    <div className="d-flex justify-content-center position-absolute top-50 start-50 translate-middle">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}



return (
  <>
    <div className="d-flex flex-column align-items-center feeder-class">
      {notifications && notifications.length > 0 ? (
        notifications.map(
          (notification, index) =>
            notification.user_id !== user_id && (
              <button
                key={index}
                className="user-details btn border border-5 rounded"
                onClick={() => {
                  // Handle click action
                }}
              >
                {notification.profile_pic != null ? (
                  <img
                    src={`data:image;base64,${notification.profile_pic}`}
                    alt=""
                    className="pic_icon"
                  />
                ) : (
                  <i className="bi bi-person-fill"></i>
                )}
                <p>{notification.username} shared the following post with you</p>
                <img
                  src={`data:image;base64,${notification.post_image}`}
                  alt=""
                  className="post_icon"
                  onClick={()=>{handlePostClick(notification.post_id)}}
                />
              </button>
            )
        )
      ) : (
        <h2>No notifications</h2>
      )}
    </div>
  </>
);

}

export default Notification_section;
