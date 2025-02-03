import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile.css";
import Topic from "../model/Topic";
import UserProfile from "../model/Userprofile";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";
import { fetchUserTopics, createNewTopic } from "../controller/TopicController";
import { fetchProfileData } from "../controller/ProfileController";
import "../css/TopicCard.css";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const [newTopicText, setNewTopicText] = useState("@");
  const [newTopicPhoto, setNewTopicPhoto] = useState<File | null>(null);
  const [newTopicPhotoPreview, setNewTopicPhotoPreview] = useState<
    string | null
  >(null);
  const [locationDetails, setLocationDetails] = useState<{
    city: string;
    state: string;
    country: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return; // ✅ Prevent API calls if user is not authenticated

    fetchProfileData(userId)
      .then(setProfileData)
      .catch((error) => console.error("Error loading profile:", error));

    fetchUserTopics(userId)
      .then(setTopics)
      .catch((error) => console.error("Error loading topics:", error));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchLocationDetails(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocationError("Location access denied");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, [userId]); // ✅ Only run effect when userId changes

  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      if (response.data && response.data.address) {
        setLocationDetails({
          city:
            response.data.address.city ||
            response.data.address.town ||
            response.data.address.village ||
            "Unknown",
          state: response.data.address.state || "Unknown",
          country: response.data.address.country || "Unknown",
        });
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
      setLocationError("Failed to retrieve location data");
    }
  };

  const handleDeleteTopic = (topicText: string, topicId: string) => {
    if (window.confirm(`Are you sure you want to delete "${topicText}"?`)) {
      deleteTopic(userId, topicId)
        .then(() => {
          // ✅ Update state to remove deleted topic from UI
          setTopics((prevTopics) =>
            prevTopics.filter((topic) => topic.id !== topicId)
          );
          alert("Topic deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting topic:", error);
          alert("Failed to delete topic. Please try again.");
        });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewTopicPhoto(file);
      setNewTopicPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleNewTopicSubmit = async () => {
    if (!userId || !locationDetails) return;

    const newTopic = {
      text: newTopicText,
      location: `${locationDetails.city}, ${locationDetails.state}, ${locationDetails.country}`,
      topicImage: newTopicPhoto || undefined, // Handle optional images
    };

    try {
      const createdTopic = await createNewTopic(
        userId,
        newTopic.text,
        newTopic.location,
        newTopic.topicImage
      );

      if (createdTopic) {
        setTopics((prevTopics) => [...prevTopics, createdTopic]); // ✅ Append new topic
        alert("Topic created successfully!");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Failed to create topic. Please try again.");
    }
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container profile-page">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-4 col-lg-4 col-12 sidebar">
          <div className="profile-section text-center">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            <h3 className="username">{profileData.username}</h3>
          </div>
          <div className="sidebar-links">
            <div className="sidebar-item">
              Supporters: {profileData.supporters}
            </div>
            <div className="sidebar-item">
              Supported: {profileData.supported}
            </div>
            <div className="sidebar-item">Settings</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8 col-lg-8 col-12 content">
          <div className="content-container">
            <div className="profile-toggle-buttons d-flex">
              <button
                className={`flex-fill btn ${
                  showTopics ? "btn-secondary" : "btn-outline-secondary"
                }`}
                onClick={() => setShowTopics(true)}
              >
                Topics
              </button>
              <button
                className={`flex-fill btn ${
                  !showTopics ? "btn-secondary" : "btn-outline-secondary"
                }`}
                onClick={() => setShowTopics(false)}
              >
                Create
              </button>
            </div>

            <div className="profile-topics-section">
              {showTopics ? (
                <div className="topics-list overflow-auto">
                  <h3>Topics</h3>

                  {topics.map((topic: Topic) => (
                    <div key={topic.id} className="topic-card">
                      <div className="topic-edit-delete">
                        <span className="edit-btn">
                          <i className="bi bi-pen"></i>
                        </span>
                        <span
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteTopic(topic.text, topic.id)
                          }
                        >
                          <i className="bi bi-trash3"></i>
                        </span>
                      </div>

                      <p>@ {topic.text}</p>

                      <div className="topic-actions ">
                        <div className="icon-container">
                          <i className="bi bi-chat-square"></i>
                        </div>
                        <div className="icon-container">
                          <i className="bi bi-send"></i>
                        </div>
                        <div className="icon-container">
                          <i className="bi bi-star"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="topic-create">
                  <h3>Create a New Topic</h3>
                  <textarea
                    id="topic-text"
                    value={newTopicText}
                    onChange={(e) => setNewTopicText(e.target.value)}
                    placeholder="Write your topic..."
                    className="form-control mb-3"
                  />
                  <div className="mb-3">
                    <input
                      type="file"
                      id="topic-photo"
                      accept="image/*"
                      className="form-control"
                      onChange={handlePhotoUpload}
                    />
                    {newTopicPhotoPreview && (
                      <div className="photo-preview mt-3">
                        <img
                          src={newTopicPhotoPreview}
                          alt="Preview"
                          className="img-fluid rounded"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleNewTopicSubmit}
                    disabled={!locationDetails}
                    className="btn btn-primary w-100"
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
