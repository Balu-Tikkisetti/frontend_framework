import React, { useState } from "react";
import "./App.css";
import Signup from "./signup.tsx";
import { api } from "./model/constants";
import { useNavigate } from "react-router-dom";

function App() {
  const [showSignup, setShowSignup] = useState(false);

  const navigate = useNavigate();
  const handleroute = () => {
    navigate("/college_media");
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    document.getElementById("first")?.classList.add("invisible");
  };

  const handleSignupClose = () => {
    setShowSignup(false);
    document.getElementById("first")?.classList.remove("invisible");
  };

  const handleLoginsubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const gmail = formData.get("gmail") as string;
    const password = formData.get("password") as string;

    fetch(api + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gmail: gmail,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Incorrect credentials");
        }
      })
      .then((data) => {
        console.log(data);
        navigate(`/college_media/${data}`);
      })
      .catch((error) => {
        console.error("Error occurred during login:", error);
        alert("Error occurred during login. Please try again.");
      });
  };

  return (
    <div>
      <div id="first" className="form-floating mb-3">
        <form onSubmit={handleLoginsubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              id="gmail"
              name="gmail"
              className="form-control"
              placeholder="gmail"
            />
            <label htmlFor="gmail">Gmail</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="password"
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <p className="signup-link">
            Don't have an account?{" "}
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSignupClick}
            >
              Sign Up
            </button>
          </p>
          <p className="forgot-password-link">
            <a href="#">Forgot your password?</a>
          </p>
        </form>
      </div>
      <div>
        {showSignup && (
          <>
            <Signup onClose={handleSignupClose} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
