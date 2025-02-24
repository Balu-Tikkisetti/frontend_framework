import { useEffect, useState } from "react";
import "../css/Country.css";
import "../css/TopicCard.css";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";


import {
  addUpvote,
  removeUpvote,
  getUpvoteCount,
  hasUserUpvoted,
} from "../controller/UpvoteController";
import { formatTimestamp } from "../utils/formatTimestamp";
import Search from "./header-components/Search";
import OpinionsModal from "./OpinionsModal";
import ImageModal from "./ImageModal";
import Topic from "../model/Topic";
import { fetchCountryTopics } from "../controller/TopicController";

const Country: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [upvotes, setUpvotes] = useState<{ [topicId: string]: number }>({});
  const [userUpvotes, setUserUpvotes] = useState<{ [topicId: string]: boolean }>({});
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState<boolean>(false);
  const [selectedTopicForOpinions, setSelectedTopicForOpinions] = useState<Topic | null>(null);

  const { userId, location } = useAuth();

  useEffect(() => {
    if (!userId || !location) return;
    const loadTopics = async () => {
      try {
        const fetchedTopics = await fetchCountryTopics(userId, location);
        setTopics(fetchedTopics);
        await fetchUpvotes(fetchedTopics);
      } catch (error) {
        console.error("Error loading topics:", error);
      }
    };
    loadTopics();
  }, [userId, location]);

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

  const handleImageClick = (imageUrl: string) => {
    if (!imageUrl) return;
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `data:image/png;base64,${imageUrl}`;
    setModalImageUrl(fullImageUrl);
    setShowImageModal(true);
  };

  const openOpinionsModal = (topic: Topic) => {
    setSelectedTopicForOpinions(topic);
    setIsOpinionsModalOpen(true);
  };

  return (
    <div className="country-page">
      <Search />
      <div className="flex-grow overflow-y-auto pb-24">
        <div className="p-6">
        
          <div className="space-y-4">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <div
                  key={topic.id.toString()}
                  className="bg-gray-800 text-white shadow-md rounded-lg p-4 topic-card"
                >
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
                       src={topic.topicImageUrl}
                        alt="Topic"
                        className="w-full rounded object-cover cursor-pointer"
                        style={{ maxHeight: "300px" }}
                        onClick={() => {
                          if(!topic.topicImageUrl) return;
                          handleImageClick(topic.topicImageUrl)
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
              ))
            ) : (
              <p className="text-gray-400">No topics available for your country.</p>
            )}
          </div>
        </div>
      </div>

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

export default Country;