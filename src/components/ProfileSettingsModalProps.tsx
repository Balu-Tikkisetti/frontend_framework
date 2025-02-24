import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { X, Save, LogOut, Trash } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


interface ProfileSettingsModalProps {
  show: boolean;
  onClose: () => void;
  profileData: {
    username: string;
    gmail: string;
    password: string;
    dob: string;
    gender: string;
    profilePicture: string | null;
    phoneNumber: string;
  };
  onSave: (updatedData: {
    username: string;
    gmail: string;
    password: string;
    dob: string;
    gender: string;
    profilePicture?: File | null;
    phoneNumber: string;
  }) => Promise<void>;
  onLogout: () => void;
  onDelete: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  show,
  onClose,
  profileData,
  onSave,
  onLogout,
  onDelete,
}) => {
  const [username, setUsername] = useState(profileData.username);
  const [gmail, setGmail] = useState(profileData.gmail);
  const [password, setPassword] = useState(profileData.password);
  const [dob, setDob] = useState<Date | null>(new Date(profileData.dob));
  const [gender, setGender] = useState(profileData.gender);
  const [phoneNumber, setPhoneNumber] = useState(profileData.phoneNumber);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(profileData.profilePicture || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setUsername(profileData.username);
      setGmail(profileData.gmail);
      setPassword(profileData.password);
      setDob(new Date(profileData.dob));
      setGender(profileData.gender);
      setPhoneNumber(profileData.phoneNumber);
      setProfilePicture(null);
      setProfilePicturePreview(profileData.profilePicture || "");
      setError("");
    }
  }, [show, profileData]);

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        username: username.trim(),
        gmail: gmail.trim(),
        password: password,
        dob: dob ? dob.toISOString().split("T")[0] : "",
        gender,
        profilePicture,
        phoneNumber: phoneNumber.trim(),
      });
      onClose();
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Form onSubmit={handleSave}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group controlId="username" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="gmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="dob" className="mb-3">
            <Form.Label>Date of Birth</Form.Label>
            <DatePicker selected={dob} onChange={(date) => setDob(date)} className="form-control" dateFormat="MM/dd/yyyy" required />
          </Form.Group>
          <Form.Group controlId="gender" className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="phoneNumber" className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="profilePicture" className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleProfilePictureChange} />
            {profilePicturePreview && (
              <div className="mt-3">
                <img src={profilePicturePreview} alt="Profile Preview" className="img-fluid rounded" style={{ maxHeight: "200px" }} />
              </div>
            )}
          </Form.Group>
          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-danger" onClick={onDelete}>
              <Trash className="me-2" /> Delete Account
            </Button>
            <Button variant="outline-secondary" onClick={onLogout}>
              <LogOut className="me-2" /> Logout
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProfileSettingsModal;
