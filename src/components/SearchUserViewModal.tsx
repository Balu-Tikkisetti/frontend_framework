import React, { useState, useEffect } from "react";
import OpinionsModal from "./OpinionsModal";
import profilePic from "../assets/unisex-profile-pic.png";
import { useAuth } from "../context/AuthContext";
import { sendMessageRequest } from "../controller/SearchController";

// Define the topic interface
export interface Topic {
  id: string;
  text: string;
  location: string;
  upvotes?: number;
  timestamp: string;
  topicImage?: string;
}

// Define the user profile interface
export interface UserProfile {
  userId: number;
  username: string;
  profilePic?: string;
  supportersCount: number;
  supportedCount:number;
  topicsCount: number;
  topics: Topic[];
  // Add additional fields as required
}

// Define props for the modal component
interface SearchUserViewModalProps {
  userProfile: UserProfile;
  onClose: () => void;
}

const SearchUserViewModal: React.FC<SearchUserViewModalProps> = ({ userProfile, onClose }) => {
  // State for opinions modal
  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  

  // Local state for topics (populated from the userProfile prop)
  const [topics, setTopics] = useState<Topic[]>([]);
  // Upvote tracking: store counts and whether the current user has upvoted each topic
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [userUpvotes, setUserUpvotes] = useState<Record<string, boolean>>({});

  const { userId } = useAuth();

  // Initialize topics and upvotes from userProfile when the modal loads or changes
  useEffect(() => {
    if (userProfile) {
      setTopics(userProfile.topics);
      const initialUpvotes: Record<string, number> = {};
      const initialUserUpvotes: Record<string, boolean> = {};
      userProfile.topics.forEach((topic) => {
        // Default to zero if upvotes is undefined
        initialUpvotes[topic.id] = topic.upvotes || 0;
        initialUserUpvotes[topic.id] = false;
      });
      setUpvotes(initialUpvotes);
      setUserUpvotes(initialUserUpvotes);
    }
  }, [userProfile]);

  // Toggle upvote status for a topic (this is front-end logic only)
  const handleUpvote = (topicId: string) => {
    setUserUpvotes((prev) => {
      const hasUpvoted = prev[topicId];
      // Update upvote count accordingly
      setUpvotes((prevUpvotes) => ({
        ...prevUpvotes,
        [topicId]: hasUpvoted ? prevUpvotes[topicId] - 1 : prevUpvotes[topicId] + 1,
      }));
      return { ...prev, [topicId]: !hasUpvoted };
    });
  };



  // Open the OpinionsModal for a given topic
  const openOpinionsModal = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsOpinionsModalOpen(true);
  };

  const closeOpinionsModal = () => {
    setIsOpinionsModalOpen(false);
    setSelectedTopic(null);
  };

  // Handle message request – add your business logic for messaging here
  const handleMessageRequest = async (recipientId:number) => {
     let currentUserId=userId;
     if (!currentUserId) {
      return alert("Unauthorized");
    }
    console.log(currentUserId);
    console.log(recipientId);
    try {
      await sendMessageRequest(currentUserId, recipientId);
      console.log(`Message request sent for user: ${recipientId}`);
      // Optionally, display a success notification in your UI
    } catch (error) {
      console.error("Error sending message request", error);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex={-1}
        aria-labelledby="searchUserViewModalLabel"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="searchUserViewModalLabel">
                {userProfile.username}&apos;s Profile
              </h1>
              
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* User Details */}
              <div className="user-details-section mb-4">
                <div className="d-flex align-items-center">
                  <img
                    src={userProfile.profilePic || profilePic}
                    alt="User Profile"
                    className="rounded-circle me-3"
                    style={{ width: "60px", height: "60px" }}
                  />
                  <div>
                    <h5>@{userProfile.username}</h5>
                    <p className="mb-0">
                      {userProfile.supportersCount} Supporter{userProfile.supportersCount !== 1 && "s"} | {userProfile.topicsCount} Topic{userProfile.topicsCount !== 1 && "s"}
                    </p>
                    <p className="mb-0">
                      {userProfile.supportersCount} Supported{userProfile.supportedCount !== 1 && "s"}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <button className="btn btn-primary" onClick={() => handleMessageRequest(userProfile.userId)}>
                    Message Request  
                  </button>
                
                </div>
              </div>

              {/* Topics Section */}
              <div className="user-topics-section">
                <h5>Topics Posted</h5>
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <div key={topic.id} className="topic-card border p-3 my-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="mb-1 fw-bold">{topic.text}</p>
                        <div className="d-flex align-items-center">
                          <button
                            className={`btn btn-sm ${userUpvotes[topic.id] ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => handleUpvote(topic.id)}
                          >
                            <i className="bi bi-rocket"></i> {upvotes[topic.id]}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => openOpinionsModal(topic)}
                          >
                            <i className="bi bi-chat-square"></i> Opinions
                          </button>
                        </div>
                      </div>
    
                    </div>
                  ))
                ) : (
                  <p>No topics available.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Opinions Modal for a selected topic */}
      {selectedTopic && (
        <OpinionsModal
          show={isOpinionsModalOpen}
          onClose={closeOpinionsModal}
          topicText={selectedTopic.text}
          topicId={selectedTopic.id}
          topicImage={selectedTopic.topicImage || null}
          username={userProfile.username}
          userProfilePic={userProfile.profilePic || profilePic}
          location={selectedTopic.location}
          timestamp={selectedTopic.timestamp}
        />
      )}
    </>
  );
};

export default SearchUserViewModal;
