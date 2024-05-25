import React, { MouseEventHandler, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import { api } from "./model/constants";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  onClose: MouseEventHandler<HTMLButtonElement>;
}

function Signup({ onClose }: SignupProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username:"",
    gmail: "",
    phone_number: "",
    dob: "",
    password: "",
    cpassword: "",
    gender: "",
    type:"",
  });
  const [passwordError, setPasswordError] = useState('');
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    const formattedDate = date?.toLocaleDateString() || "";
    setFormData((prevData) => ({
      ...prevData,
      dob: formattedDate,
    }));
  };

  const handleSubmit = () => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    if (!strongRegex.test(formData.password)) {
      setPasswordError('Password must be 8 characters long, containing at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    // Password confirmation
    if (formData.password != formData.cpassword) {
     
      setPasswordError('Passwords do not match.');
      alert('Passwords do not match.');
      return;
    }
    setPasswordError('');
    
    fetch(api + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
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
        console.error("Error occurred while signing up user:", error);
      });
  };

  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      <form
        id="singupForm"
        className="row g-3"
        onSubmit={(e) => {
          e.preventDefault();

          handleSubmit();
        }}
      >
        <div className="close-button">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>

        <div className="col-md-6">
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="form-control"
            placeholder="First name"
            aria-label="First name"
          />
        </div>

        <div className="col-md-6">
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="form-control"
            placeholder="Last name"
            aria-label="Last name"
          />
        </div>

        <div className="col-md-6">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
            placeholder="username"
            aria-label="username"
            required
          />
        </div>

        <div className="col-12">
          <input
            type="email"
            name="gmail"
            value={formData.gmail}
            onChange={handleChange}
            className="form-control"
            placeholder="Gmail"
            aria-label="Gmail"
          />
        </div>

        <div className="col-12">
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="form-control"
            placeholder="Phone Number"
            aria-label="Phone Number"
          />
        </div>

        {/* Date picker */}
        <div>
          <DatePicker
            onChange={handleDateChange}
            selected={formData.dob ? new Date(formData.dob) : null}
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText="Date of Birth"
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div className="col-auto">
          <label className="visually-hidden" htmlFor="autoSizingSelect1">
            Catageory
          </label>
          <select
            className="form-select"
            id="autoSizingSelect1"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option>Catageory</option>
            <option value="Staff">Staff</option>
            <option value="Student">Student</option>
            <option value="Alumini">Alumini</option>
          </select>
        </div>

        <div className="col-auto">
          <label className="visually-hidden" htmlFor="autoSizingSelect">
            Gender
          </label>
          <select
            className="form-select"
            id="autoSizingSelect"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option>Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="col">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Password"
            aria-label="Password"
          />
        </div>

        <div className="col">
          <input
            type="password"
            name="cpassword"
            value={formData.cpassword}
            onChange={handleChange}
            className="form-control"
            placeholder="Confirm Password"
            aria-label="Confirm Password"
          />
        </div>

        {/* Submit button */}
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;
