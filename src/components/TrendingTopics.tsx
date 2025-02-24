import React, { useState, useEffect } from "react";
import Search from "./header-components/Search";
import { useAuth } from "../context/AuthContext";

import { fetchTrendingTopics, fetchUserTopics } from "../controller/TopicController";
import { 
  addUpvote, 
  removeUpvote, 
  getUpvoteCount, 
  hasUserUpvoted 
} from "../controller/UpvoteController";
import { formatTimestamp } from "../utils/formatTimestamp";
import OpinionsModal from "./OpinionsModal";
import ImageModal from "./ImageModal";
import profilePic from "../assets/unisex-profile-pic.png";
import Topic from "../model/Topic";

const TrendingTopics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [upvotes, setUpvotes] = useState<{ [topicId: string]: number }>({});
  const [userUpvotes, setUserUpvotes] = useState<{ [topicId: string]: boolean }>({});
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState<boolean>(false);
  const [selectedTopicForOpinions, setSelectedTopicForOpinions] = useState<Topic | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  const { userId,location } = useAuth();

  useEffect(() => {
    if (!userId || !location) return;
    const loadTopics = async () => {
      try {
        const fetchedGlobalTopics = await fetchTrendingTopics(userId,location);
        setTopics(fetchedGlobalTopics);
        await fetchUpvotes(fetchedGlobalTopics);
      } catch (error) {
        console.error("Error loading topics:", error);
      }
    };
    loadTopics();
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
        Object.fromEntries(upvoteCounts.map(({ topicId, count }) => [topicId, count]))
      );
      setUserUpvotes(
        Object.fromEntries(userUpvoteStatuses.map(({ topicId, upvoted }) => [topicId, upvoted]))
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

  const handleImageClick = (topicImageUrl: string | null) => {
    if (!topicImageUrl) return;
    const imageUrl = topicImageUrl.startsWith("http")
      ? topicImageUrl
      : `data:image/png;base64,${topicImageUrl}`;
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const openOpinionsModal = (topic: Topic) => {
    setSelectedTopicForOpinions(topic);
    setIsOpinionsModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <Search />
      
      {/* Trending Panels */}
      <div className="w-full px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Trending Topics</h2>
        <div className="w-full max-w-6xl mx-auto flex gap-4 h-[500px]">
          {selectedTopics.map((topic, index) => (
            <div key={topic.id.toString()} className="flex-1 relative overflow-hidden rounded-lg group cursor-pointer"
                 onClick={() => openOpinionsModal(topic)}>
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={topic.topicImageUrl || topic.profilePicture || profilePic}
                  alt={topic.username}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Color Overlay */}
              <div className={`absolute inset-0 mix-blend-multiply ${
                index === 0 ? 'bg-red-800/30' : 
                index === 1 ? 'bg-emerald-800/30' : 
                'bg-blue-800/30'
              }`} />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 flex flex-col justify-end p-4">
                <div className="flex items-center mb-2">
                  <img
                    src={topic.profilePicture || profilePic}
                    alt={topic.username}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-white font-medium">{topic.username}</span>
                </div>
                <p className="text-white text-sm mb-1">@{topic.annotate}</p>
                <p className="text-white/90 text-sm line-clamp-2">{topic.text}</p>
                
                {/* Interaction Buttons */}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    className="flex items-center text-white/80 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      openOpinionsModal(topic);
                    }}
                  >
                    <i className="bi bi-chat-square text-lg"></i>
                  </button>
                  <button
                    className={`flex items-center ${
                      userUpvotes[topic.id.toString()]
                        ? 'text-blue-400'
                        : 'text-white/80 hover:text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUpvote(topic.id.toString());
                    }}
                  >
                    <i className="bi bi-rocket text-lg"></i>
                    <span className="ml-1">{upvotes[topic.id.toString()] || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Topics List */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <h3 className="text-xl font-bold mb-4">All Topics</h3>
        <div className="space-y-4">
          {topics.slice(3).map((topic) => (
            <div key={topic.id.toString()} 
                 className="bg-gray-800 text-white shadow-md rounded-lg p-4 topic-card">
              {/* Regular topic card content */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <img
                    src={topic.profilePicture || profilePic}
                    alt={topic.username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <div>
                    <span className="font-bold">{topic.username}</span>
                    <span className="text-gray-400 text-sm block">
                      {topic.location}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-2">
                <p className="font-semibold">@{topic.annotate}</p>
                <p>{topic.text}</p>
              </div>

              {topic.topicImageUrl && (
                <div className="mb-2">
                  <img
                    src={topic.topicImageUrl.startsWith("http")
                      ? topic.topicImageUrl
                      : `data:image/png;base64,${topic.topicImageUrl}`}
                    alt="Topic"
                    className="w-full rounded object-cover cursor-pointer"
                    style={{ maxHeight: "300px" }}
                    onClick={() => handleImageClick(topic.topicImageUrl)}
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
                <button
                  className={`flex items-center transition-all duration-200 ${
                    userUpvotes[topic.id.toString()]
                      ? "text-blue-500"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => toggleUpvote(topic.id.toString())}
                >
                  <i className="bi bi-rocket text-xl"></i>
                  <span className="ml-4">{upvotes[topic.id.toString()] || 0}</span>
                </button>
              </div>
              <div className="mt-2 text-gray-400 text-xs">
                {formatTimestamp(topic.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedTopicForOpinions && (
        <OpinionsModal
          show={isOpinionsModalOpen}
          onClose={() => setIsOpinionsModalOpen(false)}
          topicText={selectedTopicForOpinions.text}
          topicId={selectedTopicForOpinions.id.toString()}
          topicImage={selectedTopicForOpinions.topicImageUrl || null}
          username={selectedTopicForOpinions.username}
          userProfilePic={selectedTopicForOpinions.profilePicture || profilePic}
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

export default TrendingTopics;