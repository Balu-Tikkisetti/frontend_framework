import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NotificationPost from "./components/Notifications.tsx";
import PrivateRoute from "./context/PrivateRoute.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import TopicsWorld from "./topicsWorld.tsx";

export default function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<App />} />

        {/* Protected Route */}
        <Route
          path="/topicsWorld"
          element={
            <PrivateRoute>
              <TopicsWorld />
            </PrivateRoute>
          }
        />

        {/* Other Routes */}
        <Route
          path="/notificationpost/:post_id"
          element={<NotificationPost />}
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Routers />
    </AuthProvider>
  </React.StrictMode>
);
