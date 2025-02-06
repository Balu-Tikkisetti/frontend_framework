import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import { api } from "./model/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

interface SignupProps {
  onClose: () => void;
}

interface FormData {
  username: string;
  gmail: string;
  dob: Date | null;
  password: string;
  gender: string;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

const Signup: React.FC<SignupProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    gmail: "",
    dob: null,
    password: "",
    gender: "",
  });

  const [error, setError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const handleChange = (e: InputChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      dob: date
    });
  };

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    if (!strongRegex.test(formData.password)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    setPasswordError("");

    try {
      const formSubmission = new FormData();
      formSubmission.append("username", formData.username);
      formSubmission.append("gmail", formData.gmail);
      formSubmission.append("password", formData.password);
      formSubmission.append(
        "dob",
        formData.dob ? formData.dob.toISOString().split("T")[0] : ""
      );
      formSubmission.append("gender", formData.gender);

      const response = await fetch(api + "/signup", {
        method: "POST",
        body: formSubmission,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed.");
      }

      const data = await response.json();
      await fetchUser({ userId: data.id, accessToken: data.accessToken });
      navigate("/topicsWorld");
    } catch (error) {
      console.error("Error occurred during signup:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center signup-overlay">
      <div className="card signup-card">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="company-title m-0">Create Account</h2>
            
          </div>

          {(error || passwordError) && (
            <div className="alert alert-danger" role="alert">
              {error || passwordError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="needs-validation">
            <div className="mb-3">
              <label htmlFor="signup-username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="signup-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="signup-email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="signup-email"
                name="gmail"
                value={formData.gmail}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="signup-dob" className="form-label">
                Date of Birth
              </label>
              <DatePicker
                selected={formData.dob}
                onChange={handleDateChange}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                required
                placeholderText="Select date"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="signup-gender" className="form-label">
                Gender
              </label>
              <select
                id="signup-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="signup-password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="signup-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-lg mb-2"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline-secondary btn-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;