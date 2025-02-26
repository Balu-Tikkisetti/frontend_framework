import React, { useState, useEffect } from "react";
import "../css/Community.css";
import Search from "./header-components/Search";
import Topic from "../model/Topic";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";
import { fetchCommunityTopics } from "../controller/TopicController";
import {
  addUpvote,
  removeUpvote,
  getUpvoteCount,
  hasUserUpvoted,
} from "../controller/UpvoteController";
import { formatTimestamp } from "../utils/formatTimestamp";
import OpinionsModal from "./OpinionsModal";
import ImageModal from "./ImageModal";

const Community: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [userUpvotes, setUserUpvotes] = useState<Record<string, boolean>>({});
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState(false);
  const [selectedTopicForOpinions, setSelectedTopicForOpinions] = useState<Topic | null>(null);
  
  const { userId, location } = useAuth();

  // Define fetchUpvotes outside useEffect to use as a dependency
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
        Object.fromEntries(upvoteCounts.map(({ topicId, count }) => [topicId, count]))
      );
      setUserUpvotes(
        Object.fromEntries(userUpvoteStatuses.map(({ topicId, upvoted }) => [topicId, upvoted]))
      );
    } catch (error) {
      console.error("Error fetching upvotes:", error);
    }
  };

  useEffect(() => {
    if (!userId || !location) return;
    const loadTopics = async () => {
      try {
        const fetchedTopics = await fetchCommunityTopics(userId, location);
        setTopics(fetchedTopics);
        void fetchUpvotes(fetchedTopics);
      } catch (error) {
        console.error("Error loading community topics:", error);
      }
    };
    void loadTopics();
  }, [userId, location, fetchUpvotes]);

  const toggleUpvote = async (topicId: string) => {
    if (!userId) return;
    const currentUpvoted = userUpvotes[topicId] ?? false;
    const newUpvotes = {
      ...upvotes,
      [topicId]: (upvotes[topicId] ?? 0) + (currentUpvoted ? -1 : 1),
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

  // Wrapper for toggleUpvote that doesn't return a promise
  const handleToggleUpvote = (topicId: string) => {
    void toggleUpvote(topicId);
  };

  const handleImageClick = (topicImageUrl: string) => {
    if (!topicImageUrl) return;
    setModalImageUrl(topicImageUrl);
    setShowImageModal(true);
  };

  const openOpinionsModal = (topic: Topic) => {
    setSelectedTopicForOpinions(topic);
    setIsOpinionsModalOpen(true);
  };

  return (
    <div className="community-page">
      <Search />
      <div className="community-topics-container overflow-scroll">
        <div className="flex-grow overflow-y-auto pb-24">
          <div className="p-6">
            <p className="text-xl font-bold mb-4">Topics</p>
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id.toString()} className="bg-gray-800 text-white shadow-md rounded-lg p-4 topic-card">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <img
                        src={topic.profilePicture ?? profilePic}
                        alt={topic.username}
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <div>
                        <span className="font-bold">{topic.username}</span>
                        <span className="text-gray-400 text-sm block">{topic.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-8">
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="font-semibold">@{topic.annotate}</p>
                    <p>{topic.text}</p>
                  </div>
                  {topic.topicImageUrl && (
                    <div className="mb-2">
                      <img
                        src={topic.topicImageUrl}
                        alt="Topic"
                        className="w-full rounded object-cover cursor-pointer"
                        style={{ maxHeight: "300px" }}
                        onClick={() => {
                          if(!topic.topicImageUrl) return;
                          handleImageClick(topic.topicImageUrl);
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
                      onClick={() => handleToggleUpvote(topic.id.toString())}
                    >
                      <i className="bi bi-rocket text-xl"></i>
                      <span className="ml-4">{upvotes[topic.id.toString()] ?? 0}</span>
                    </button>
                  </div>
                  <div className="mt-2 text-gray-400 text-xs">
                    {formatTimestamp(topic.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isOpinionsModalOpen && selectedTopicForOpinions && (
        <OpinionsModal
          show={isOpinionsModalOpen}
          onClose={() => setIsOpinionsModalOpen(false)}
          topicText={selectedTopicForOpinions.text}
          topicId={selectedTopicForOpinions.id.toString()}
          topicImage={selectedTopicForOpinions.topicImageUrl ?? null}
          username={selectedTopicForOpinions.username}
          userProfilePic={selectedTopicForOpinions.profilePicture ?? profilePic}
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
    </div>
  );
};

export default Community;