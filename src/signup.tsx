import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import { api } from "./model/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Check, X } from "lucide-react";
import axios from "axios";

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

type InputChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;
type FormSubmitEvent = FormEvent<HTMLFormElement>;

// Define the password requirements array.
const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "At least one uppercase letter" },
  { regex: /[a-z]/, label: "At least one lowercase letter" },
  { regex: /[0-9]/, label: "At least one number" },
  { regex: /[!@#$%^&*]/, label: "At least one special character" },
];

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

  // Live validation state: each index corresponds to a requirement.
  const [validRequirements, setValidRequirements] = useState<boolean[]>(
    new Array(passwordRequirements.length).fill(false)
  );
  const [error, setError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // Update live password validation every time the password changes.
  useEffect(() => {
    const newValidRequirements = passwordRequirements.map((req) =>
      req.regex.test(formData.password)
    );
    setValidRequirements(newValidRequirements);
  }, [formData.password]);

  const handleChange = (e: InputChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (e.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      dob: date,
    }));
  };

  const handleSubmit = async (e: FormSubmitEvent) => {
  e.preventDefault();

  if (!validRequirements.every(Boolean)) {
    setPasswordError("Please meet all password requirements.");
    return;
  }
  setPasswordError("");

  try {
    const submissionData = new FormData();
    submissionData.append("username", formData.username);
    submissionData.append("gmail", formData.gmail);
    submissionData.append("password", formData.password);
    // Ensure the date format matches what your backend expects.
    // If the backend expects "MM-dd-yyyy", you may need to reformat.
    // For now, we're sending "yyyy-MM-dd" from toISOString().split("T")[0]
    submissionData.append("dob", formData.dob ? formData.dob.toISOString().split("T")[0] : "");
    submissionData.append("gender", formData.gender);

    const response = await axios.post(api + "/signup", submissionData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    const data = response.data;
    await fetchUser({ userId: data.id, accessToken: data.accessToken });
    navigate("/topicsWorld");
  } catch (err: any) {
    // Log detailed error info for debugging.
    if (err.response) {
      console.error("Error response data:", err.response.data);
    }
    console.error("Error occurred during signup:", err);
    setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
                dateFormat="MM/dd/yyyy"
                placeholderText="MM/DD/YYYY"
                required
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
                <option value="" disabled>
                  Select Gender
                </option>
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
              {/* Live Password Validation Display */}
              <div className="mt-2">
                {passwordRequirements.map((req, index) => (
                  <div key={req.label} className="d-flex align-items-center">
                    {validRequirements[index] ? (
                      <Check className="text-success me-2" size={16} />
                    ) : (
                      <X className="text-danger me-2" size={16} />
                    )}
                    <small>{req.label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary btn-lg mb-2">
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
