import React, { useState } from "react";
import "./index.css";
import Signup from "./signup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";


function App() {
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();
  const { fetchUser } = useAuth(); // Access AuthContext's fetchUser

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
  };

  const handleLoginsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      // Login using API
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed.");
      }

      // Extract user data from the login response
      const data = await response.json();

      // Set user in AuthContext without additional backend calls
      await fetchUser({ userId: data.id, username: data.username });

      // Navigate to protected route
      navigate("/topicsWorld");
    } catch (error: any) {
      console.error("Error during login:", error);
      alert(error.message);
    }
  };

  return (
    <div className="custom-container">
      <div className="form-box">
        {showSignup ? (
          <Signup onClose={handleSignupClose} />
        ) : (
          <form onSubmit={handleLoginsubmit}>
            <h2>T@pics</h2>
            <div className="form-floating mb-3">
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                placeholder="username"
                required
              />
              <label htmlFor="username">Username</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Password"
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Enter
            </button>
            <div className="text-center mt-3">
              <span className="or-divider">OR</span>
            </div>
            <button
              type="button"
              className="btn btn-success w-100 mt-2"
              onClick={handleSignupClick}
            >
              Create
            </button>
            <p className="text-center mt-3 forgot-password-link">
              <a href="#">Forgot your password?</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
