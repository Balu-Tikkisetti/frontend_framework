import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile.css";
import Topic from "../model/Topic";
import UserProfile from "../model/Userprofile";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";
import {
  fetchUserTopics,
  createNewTopic,
  deleteTopic,
} from "../controller/TopicController";
import { deleteUser, fetchProfileData } from "../controller/ProfileController";
import "../css/TopicCard.css";
import EditTopicModal from "./EditTopicModal";
import OpinionsModal from "./OpinionsModal";
import {
  addUpvote,
  removeUpvote,
  getUpvoteCount,
  hasUserUpvoted,
} from "../controller/UpvoteController";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const [newTopicText, setNewTopicText] = useState("");
  const [newTopicPhoto, setNewTopicPhoto] = useState<File | null>(null);

  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState(false);
  const [selectedTopicForOpinions, setSelectedTopicForOpinions] =
    useState<Topic | null>(null);

  const [selectedTopic, setSelectedTopic] = useState<{
    text: string;
    id: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Upvotes State Management
  const [upvotes, setUpvotes] = useState<{ [topicId: string]: number }>({});
  const [userUpvotes, setUserUpvotes] = useState<{
    [topicId: string]: boolean;
  }>({});

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
      .then(async (fetchedTopics) => {
        setTopics(fetchedTopics);
        fetchUpvotes(fetchedTopics); // ✅ Fetch upvotes after loading topics
      })
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

  const fetchUpvotes = async (topics: Topic[]) => {
    if (!userId) return;

    try {
      // ✅ Fetch upvote counts for all topics
      const upvoteCounts = await Promise.all(
        topics.map(async (topic) => {
          const count = await getUpvoteCount(topic.id.toString());
          return { topicId: topic.id.toString(), count };
        })
      );

      // ✅ Fetch user upvote status for all topics
      const userUpvoteStatuses = await Promise.all(
        topics.map(async (topic) => {
          const upvoted = await hasUserUpvoted(userId, topic.id.toString());
          return { topicId: topic.id.toString(), upvoted };
        })
      );

      // ✅ Update state
      setUpvotes(
        Object.fromEntries(
          upvoteCounts.map(({ topicId, count }) => [topicId, count])
        )
      );
      setUserUpvotes(
        Object.fromEntries(
          userUpvoteStatuses.map(({ topicId, upvoted }) => [topicId, upvoted])
        )
      );
    } catch (error) {
      console.error("❌ Error fetching upvotes:", error);
    }
  };

  const toggleUpvote = async (topicId: string) => {
    if (!userId) return;

    const currentUpvoted = userUpvotes[topicId] || false;
    const newUpvotes = {
      ...upvotes,
      [topicId]: (upvotes[topicId] || 0) + (currentUpvoted ? -1 : 1),
    };
    const newUserUpvotes = { ...userUpvotes, [topicId]: !currentUpvoted };

    // ✅ Optimistic UI update
    setUpvotes(newUpvotes);
    setUserUpvotes(newUserUpvotes);

    try {
      if (!currentUpvoted) {
        await addUpvote(userId, topicId); // ✅ Call UpvoteController function
      } else {
        await removeUpvote(userId, topicId); // ✅ Call UpvoteController function
      }
    } catch (error) {
      console.error("❌ Error updating upvote:", error);
      // ❌ Revert UI on failure
      setUpvotes(upvotes);
      setUserUpvotes(userUpvotes);
    }
  };

  const handleDeleteTopic = async (topicText: string, topicId: string) => {
    if (!userId) {
      alert(" User not authenticated!");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${topicText}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteTopic(userId, topicId);
      alert("✅ Topic deleted successfully!");

      // ✅ Remove the topic from state after successful deletion
      setTopics((prevTopics) =>
        prevTopics.filter((topic) => topic.id !== topicId)
      );
    } catch (error) {
      alert(" Error deleting topic. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      alert("❌ User not authenticated!");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this account with username "${
        profileData?.username || "Unknown"
      }" and "${topics.length} topic${topics.length !== 1 ? "s" : ""}"?`
    );

    if (!confirmDelete) return;

    try {
      alert("⏳ Deleting account... Please wait.");
      await deleteUser(userId);
      // ✅ Inform user & redirect to home page (or login page)
      alert("✅ Account deleted successfully!");
      window.location.href = "/";
    } catch (error) {
      alert(" Error deleting account. Please try again.");
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

  const openEditModal = (topicText: string, topicId: string) => {
    setSelectedTopic({ text: topicText, id: topicId });
    setIsModalOpen(true);
  };

  const openOpinionsModal = (topic: Topic) => {
    setSelectedTopicForOpinions(topic);
    setIsOpinionsModalOpen(true);
  };

  const handleSaveEdit = (updatedText: string, topicId: string) => {
    console.log(`Saving topic: ${topicId} with new text: ${updatedText}`);
    // TODO: Call API to update topic in the backend
    setIsModalOpen(false);
  };

  const handleLogout = () => {};

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
            <div className="sidebar-item ">
              <button type="button" className="btn btn-warning w-35">
                Edit Profile
              </button>
            </div>
            <div className="sidebar-item">
              <button
                type="button"
                className="btn btn-primary w-35"
                onClick={handleLogout}
              >
                Exit
              </button>
            </div>
            <div className="sidebar-item">
              <button
                className="btn btn-danger w-35"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
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
                  {topics.map((topic: Topic) => (
                    <div key={topic.id.toString()} className="topic-card">
                      {" "}
                      <div className="topic-header">
                        <div className="profile-section">
                          <img
                            src={profileData.profilePic || profilePic}
                            alt="Profile"
                            className="topic-profile-pic "
                          />
                          <span className="topic-username">
                            {profileData.username} - {topic.location}
                          </span>
                        </div>

                        <div className="topic-edit-delete">
                          <span
                            className="edit-btn"
                            onClick={() =>
                              openEditModal(topic.text, topic.id.toString())
                            }
                          >
                            <i className="bi bi-pen"></i>
                          </span>

                          <span
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteTopic(topic.text, topic.id.toString())
                            } // ✅ Convert ObjectId to string
                          >
                            <i className="bi bi-trash3"></i>
                          </span>
                        </div>
                      </div>
                      <p>@ {topic.text}</p>
                      <div className="topic-actions ">
                        <div
                          className="icon-container opinion-container"
                          onClick={() => openOpinionsModal(topic)}
                        >
                          <i className="bi bi-chat-square"></i>
                        </div>

                        <div className="icon-container">
                          <i className="bi bi-send"></i>
                        </div>
                        <div
                          className={`icon-container upvote-container ${
                            userUpvotes[topic.id.toString()] ? "upvoted" : ""
                          }`}
                          onClick={() => toggleUpvote(topic.id.toString())}
                        >
                          <i className="bi bi-rocket"></i>
                          <span className="upvote-count">
                            {upvotes[topic.id.toString()] || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* ✅ Render Modal */}
                  {selectedTopic && (
                    <EditTopicModal
                      show={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      topicText={selectedTopic.text}
                      topicId={selectedTopic.id}
                      onSave={handleSaveEdit}
                    />
                  )}

                  {selectedTopicForOpinions && (
                    <OpinionsModal
                      show={isOpinionsModalOpen}
                      onClose={() => setIsOpinionsModalOpen(false)}
                      topicText={selectedTopicForOpinions.text}
                      topicId={selectedTopicForOpinions.id.toString()}
                      topicImage={selectedTopicForOpinions.topicImage || null}
                      username={profileData.username}
                      userProfilePic={profileData.profilePic || null}
                      location={selectedTopicForOpinions.location}
                      timestamp={selectedTopicForOpinions.timestamp}
                    />
                  )}
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
