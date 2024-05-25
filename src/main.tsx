import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import CollegeMedia from "./college_media.tsx";
import ProfileEdit from "./components/profile_edit.tsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PostEdit from "./components/Post_edit.tsx";
import SearchProfileView from "./components/SearchProfileView.tsx";
import Search from "./components/Search.tsx";
import NotificationPost from "./components/NotificationPost.tsx";
export default function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/college_media/:user_id" Component={CollegeMedia} />
        <Route path="/profile_edit/:user_id" Component={ProfileEdit}/>
        <Route path="post_edit/:post_id" Component={PostEdit}/>
        <Route path="search_profile_view/:user_id/:search_user_id" Component={SearchProfileView}/>  
        <Route path="search/:user_id/:hashtag" Component={Search}/> 
        <Route path="notificationpost/:user_id/:post_id"  Component={NotificationPost}/>   
        </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Routers />
  </React.StrictMode>
);
