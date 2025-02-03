import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import { api } from "./model/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // ✅ Import AuthContext

interface SignupProps {
  onClose: () => void;
}

const Signup: React.FC<SignupProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth(); // ✅ Destructure fetchUser from AuthContext

  const [formData, setFormData] = useState({
    username: "",
    gmail: "",
    dob: null as Date | null, // ✅ Store Date object
    password: "",
    gender: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle DatePicker change
  const handleDateChange = (date: Date | null) => {
    setFormData((prevData) => ({
      ...prevData,
      dob: date, // ✅ Store actual Date object
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password validation
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    if (!strongRegex.test(formData.password)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    setPasswordError(""); // ✅ Clear previous errors

    try {
      // ✅ Use FormData for sending data
      const formSubmission = new FormData();
      formSubmission.append("username", formData.username);
      formSubmission.append("gmail", formData.gmail);
      formSubmission.append("password", formData.password);
      formSubmission.append("dob", formData.dob ? formData.dob.toISOString().split("T")[0] : ""); // Format YYYY-MM-DD
      formSubmission.append("gender", formData.gender);

      // Signup API call
      const response = await fetch(api + "/signup", {
        method: "POST",
        body: formSubmission, // ✅ Sending as FormData (no JSON)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed.");
      }

      const data = await response.json();

      // ✅ Set user in AuthContext
      await fetchUser({ userId: data.id, username: data.username });

      // ✅ Navigate to the topics world page
      navigate("/topicsWorld");
    } catch (error: any) {
      console.error("Error occurred during signup:", error);
      alert(error.message);
    }
  };

  return (
    <form id="signupForm" onSubmit={handleSubmit}>
      <div className="form-floating mb-3">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="form-control"
          id="username"
          placeholder="Username"
          required
        />
        <label htmlFor="username">Username</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="email"
          name="gmail"
          value={formData.gmail}
          onChange={handleChange}
          className="form-control"
          id="gmail"
          placeholder="Gmail"
          required
        />
        <label htmlFor="gmail">Gmail</label>
      </div>

      <div className="form-floating mb-3">
        <DatePicker
          selected={formData.dob}
          onChange={handleDateChange}
          placeholderText="Date of Birth"
          className="form-control"
          id="dob"
          required
          dateFormat="yyyy-MM-dd" // ✅ Proper formatting
        />
      </div>

      <div className="form-floating mb-3">
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="form-select"
          id="gender"
          required
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <label htmlFor="gender">Gender</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="form-control"
          id="password"
          placeholder="Password"
          required
        />
        <label htmlFor="password">Password</label>
        {passwordError && <div className="text-danger">{passwordError}</div>}
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Create
      </button>
      <button type="button" className="btn btn-success w-100 mt-2" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
};

export default Signup;
