import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile.css";
import "../css/TopicCard.css";
import ImageModal from "./ImageModal";
import Topic from "../model/Topic";
import UserProfile from "../model/Userprofile";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";

import OpinionsModal from "./OpinionsModal";
import CreateTopicModal from "./CreateTopicModal";

import {
  fetchUserTopics,
  createNewTopic,
  deleteTopic,
} from "../controller/TopicController";
import { deleteUser, fetchProfileData } from "../controller/ProfileController";
import {
  addUpvote,
  removeUpvote,
  getUpvoteCount,
  hasUserUpvoted,
} from "../controller/UpvoteController";
import { Settings } from "lucide-react";
import { formatTimestamp } from "../utils/formatTimestamp";
import ProfileSettingsModal from "./ProfileSettingsModalProps";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showTopics, setShowTopics] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // For opinions modal, store the full Topic
  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState(false);
  const [selectedTopicForOpinions, setSelectedTopicForOpinions] =
    useState<Topic | null>(null);

  // Upvote state management
  const [upvotes, setUpvotes] = useState<{ [topicId: string]: number }>({});
  const [userUpvotes, setUserUpvotes] = useState<{
    [topicId: string]: boolean;
  }>({});

  // Remove local location state – use global location from AuthContext instead.
  const { userId, location, logout } = useAuth();

  // DRAGGABLE BUTTON STATE
  const [dragPos, setDragPos] = useState({ x: 300, y: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!userId) return;

    fetchProfileData(userId)
      .then(setProfileData)
      .catch((error) => console.error("Error loading profile:", error));

    fetchUserTopics(userId)
      .then(async (fetchedTopics) => {
        setTopics(fetchedTopics);
        fetchUpvotes(fetchedTopics);
      })
      .catch((error) => console.error("Error loading topics:", error));
  }, [userId]);

  const fetchUpvotes = async (topics: Topic[]) => {
    if (!userId) return;
    try {
      const upvoteCounts = await Promise.all(
        topics.map(async (topic) => {
          const count = await getUpvoteCount(topic.id.toString());
          return { topicId: topic.id.toString(), count };
        })
      );
      const userUpvoteStatuses = await Promise.all(
        topics.map(async (topic) => {
          const upvoted = await hasUserUpvoted(userId, topic.id.toString());
          return { topicId: topic.id.toString(), upvoted };
        })
      );
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
      console.error("Error fetching upvotes:", error);
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

    setUpvotes(newUpvotes);
    setUserUpvotes(newUserUpvotes);

    try {
      if (!currentUpvoted) {
        await addUpvote(userId, topicId);
      } else {
        await removeUpvote(userId, topicId);
      }
    } catch (error) {
      console.error("Error updating upvote:", error);
      setUpvotes(upvotes);
      setUserUpvotes(userUpvotes);
    }
  };

  const handleDeleteTopic = async (topicText: string, topicId: string) => {
    if (!userId) {
      alert("User not authenticated!");
      return;
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${topicText}"?`
    );
    if (!confirmDelete) return;
    try {
      await deleteTopic(userId, topicId);
      alert("Topic deleted successfully!");
      setTopics((prevTopics) =>
        prevTopics.filter((topic) => topic.id !== topicId)
      );
    } catch (error) {
      alert("Error deleting topic. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      alert("User not authenticated!");
      return;
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this account with username "${
        profileData?.username || "Unknown"
      }" and "${topics.length} topic${topics.length !== 1 ? "s" : ""}"?`
    );
    if (!confirmDelete) return;
    try {
      alert("Deleting account... Please wait.");
      await deleteUser(userId);
      alert("Account deleted successfully!");
      window.location.href = "/";
    } catch (error) {
      alert("Error deleting account. Please try again.");
    }
  };

  // Updated handleNewTopicSubmit accepts annotate, text, and topicImage from CreateTopicModal.
  const handleNewTopicSubmit = async (
    annotate: string,
    text: string,
    topicImage: File | null
  ) => {
    if (!userId || !location) return;
    const newTopicData = {
      annotate,
      text,
      // Use the global location from AuthContext
      location,
      topicImage: topicImage || undefined,
    };
    try {
      const createdTopic = await createNewTopic(
        userId,
        newTopicData.annotate,
        newTopicData.text,
        newTopicData.location,
        newTopicData.topicImage
      );
      if (createdTopic) {
        setTopics((prevTopics) => [...prevTopics, createdTopic]);
        alert("Topic created successfully!");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Failed to create topic. Please try again.");
    }
  };

  const openOpinionsModal = (topic: Topic) => {
    setSelectedTopicForOpinions(topic);
    setIsOpinionsModalOpen(true);
  };

  // DRAG EVENT HANDLERS FOR THE FLOATING BUTTON
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - dragPos.x,
      y: e.clientY - dragPos.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setDragPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Dummy implementations for settings actions
  const handleProfileSave = async (updatedData: {
    username: string;
    gmail: string;
    password: string;
    dob: string;
    gender: string;
    profilePicture?: File | null;
    phoneNumber: string;
  }) => {
    console.log("Profile updated:", updatedData);
    // TODO: Call backend update API and update state accordingly.
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect the user after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Logout failed. Please try again.");
    }
  };
  

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="relative h-screen flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative px-6 pt-4">
        <div className="absolute top-4 right-6">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 pt-2">
        <div className="flex items-start space-x-4">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <img
              src={profilePic}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {profileData.username}
            </h2>
            <div className="flex space-x-6 text-sm">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-gray-900">
                  {profileData.supporters}
                </span>
                <span className="text-gray-500 text-xs">Supporters</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-gray-900">
                  {profileData.supported}
                </span>
                <span className="text-gray-500 text-xs">Supported</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-gray-900">
                  {topics.length}
                </span>
                <span className="text-gray-500 text-xs">Topics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="flex-grow overflow-y-auto pb-24">
        <div className="p-6">
          <p className="text-xl font-bold mb-4">T@pics</p>
          <div className="space-y-4">
            {topics.map((topic) => (
              <div
                key={topic.id.toString()}
                className="bg-gray-800 text-white shadow-md rounded-lg p-4 topic-card"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <img
                      src={profilePic}
                      alt={profileData.username}
                      className="w-10 h-10 rounded-full mr-2"
                    />
                    <div>
                      <span className="font-bold">{profileData.username}</span>
                      <span className="text-gray-400 text-sm block">
                        {topic.location}
                      </span>
                    </div>
                  </div>
                  {/*  Delete action */}
                  <div className="flex items-center gap-x-8">
                    <button
                      className="flex items-center text-gray-300 hover:text-white transition-all duration-200"
                      onClick={() =>
                        handleDeleteTopic(topic.text, topic.id.toString())
                      }
                    >
                      <i className="bi bi-trash text-xl"></i>
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  {/* Display annotate and text */}
                  <p className="font-semibold">@{topic.annotate}</p>
                  <p>{topic.text}</p>
                </div>

                {topic.topicImageUrl && (
                  <div className="mb-2">
                    <img
                      src={
                        topic.topicImageUrl.startsWith("http")
                          ? topic.topicImageUrl
                          : `data:image/png;base64,${topic.topicImageUrl}`
                      }
                      alt="Topic"
                      className="w-full rounded object-cover cursor-pointer"
                      style={{ maxHeight: "300px" }}
                      onClick={() => {
                        if (!topic.topicImageUrl) return; // Guard clause for null value
                        const imageUrl = topic.topicImageUrl.startsWith("http")
                          ? topic.topicImageUrl
                          : `data:image/png;base64,${topic.topicImageUrl}`;
                        setModalImageUrl(imageUrl);
                        setShowImageModal(true);
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-x-16">
                  <button
                    className="flex items-center text-gray-300 hover:text-white transition-all duration-200"
                    onClick={() => openOpinionsModal(topic)}
                  >
                    <i className="bi bi-chat-square text-xl"></i>
                  </button>
                  <button className="flex items-center text-gray-300 hover:text-white transition-all duration-200">
                    <i className="bi bi-send text-xl"></i>
                  </button>
                  <button
                    className={`flex items-center transition-all duration-200 ${
                      userUpvotes[topic.id.toString()]
                        ? "text-blue-500"
                        : "text-gray-300 hover:text-white"
                    }`}
                    onClick={() => toggleUpvote(topic.id.toString())}
                  >
                    <i className="bi bi-rocket text-xl"></i>
                    <span className="ml-4">
                      {upvotes[topic.id.toString()] || 0}
                    </span>
                  </button>
                </div>
                <div className="mt-2 text-gray-400 text-xs">
                  {formatTimestamp(topic.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draggable Floating "Create Topic" Button */}
        <button
          onMouseDown={handleMouseDown}
          style={{
            borderRadius: "50%",
            position: "absolute",
            left: dragPos.x,
            top: dragPos.y,
          }}
          className="z-50 bg-blue-600 text-white w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowCreateModal(true)}
        >
          @
        </button>
      </div>

      <CreateTopicModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={(topicData: {
          annotate: string;
          text: string;
          photo: File | null;
        }) => {
          handleNewTopicSubmit(
            topicData.annotate,
            topicData.text,
            topicData.photo
          );
          setShowCreateModal(false);
        }}
      />

      {isOpinionsModalOpen && selectedTopicForOpinions && (
        <OpinionsModal
          show={isOpinionsModalOpen}
          onClose={() => setIsOpinionsModalOpen(false)}
          topicText={selectedTopicForOpinions.text}
          topicId={selectedTopicForOpinions.id.toString()}
          topicImage={selectedTopicForOpinions.topicImageUrl || null}
          username={profileData.username}
          userProfilePic={profilePic}
          location={selectedTopicForOpinions.location}
          timestamp={selectedTopicForOpinions.timestamp}
        />
      )}

      {showImageModal && (
        <ImageModal
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          imageUrl={modalImageUrl}
        />
      )}

      {showSettingsModal && profileData && (
        <ProfileSettingsModal
          show={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          profileData={profileData}
          onSave={handleProfileSave}
          onLogout={handleLogout}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default Profile;
