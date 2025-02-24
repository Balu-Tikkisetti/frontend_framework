import React, { useState, useEffect, ChangeEvent } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchOpinions, addOpinion } from "../controller/OpinionController";
import profilePic from "../assets/unisex-profile-pic.png";


export interface Opinion {
  username: string;
  userProfilePic: string | null;
  opinionText: string;
  timestamp: string;
}

export interface OpinionsModalProps {
  show: boolean;
  onClose: () => void;
  topicText: string;
  topicId: string;
  topicImage?: string | null;
  username: string;
  userProfilePic?: string | null;
  location: string;
  timestamp: string;
}

// Utility: Format a timestamp into relative time (e.g., "5 mins ago", "3 hrs ago", or formatted date)
const formatRelativeTime = (timestamp: string): string => {
  const time = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  if (days < 365) return `${days} days ago`;
  const years = Math.floor(days / 365);
  return `${years} yrs ago`;
};

const OpinionsModal: React.FC<OpinionsModalProps> = ({
  show,
  onClose,
  topicText,
  topicId,
  topicImage,
  username,
  userProfilePic,
  location,
  timestamp,
}) => {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [newOpinion, setNewOpinion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userId } = useAuth();

  // Fetch opinions when modal opens
  useEffect(() => {
    if (show && topicId) {
      const loadOpinions = async () => {
        setIsLoading(true);
        try {
          const fetchedOpinions = await fetchOpinions(topicId);
          setOpinions(fetchedOpinions);
        } catch (error: any) {
          console.error("Error fetching opinions:", error.message || error);
        } finally {
          setIsLoading(false);
        }
      };
      loadOpinions();
    }
  }, [show, topicId]);

  // Handle new opinion submission
  const handleOpinionSubmit = async () => {
    if (!newOpinion.trim()) return;
    if (!userId) {
      alert("You must be logged in to add an opinion.");
      return;
    }
    try {
      await addOpinion(userId, topicId, newOpinion);
      const newOp: Opinion = {
        username,
        userProfilePic: userProfilePic || null,
        opinionText: newOpinion,
        timestamp: new Date().toISOString(),
      };
      setOpinions(prev => [newOp, ...prev]);
      setNewOpinion("");
    } catch (error: any) {
      console.error("Error adding opinion:", error.message || error);
      alert("Failed to add opinion. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm modal-enter">
      <div className="relative w-full max-w-2xl mx-4 md:mx-auto opinions-modal">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opinions</h3>
            <button
              onClick={onClose}
              aria-label="Close opinions modal"
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Topic Details Section */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-2">
              <img src={profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{username}</span>
            </div>
            <div className="space-y-2">
              <p className="text-base text-gray-900 dark:text-white">{topicText}</p>
              {topicImage && (
                <img
                  src={topicImage.startsWith("http") ? topicImage : `data:image/png;base64,${topicImage}`}
                  alt="Topic"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{location} • {formatRelativeTime(timestamp)}</span>
            </div>
          </div>

          {/* Opinions List */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto opinions-scroll">
            {isLoading ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading opinions...</p>
            ) : opinions.length > 0 ? (
              <div className="space-y-4">
                {opinions.map((op, idx) => (
                  <div key={idx} className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg opinion-item-hover">
                    <img src={profilePic} alt="User" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{op.username}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{op.opinionText}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(op.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                No opinions yet. Be the first to share your thoughts!
              </p>
            )}
          </div>

          {/* Input Section */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 opinion-input-container">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newOpinion}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewOpinion(e.target.value)}
                placeholder="Share your opinion..."
                className="flex-1 min-w-0 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 input-placeholder"
              />
              <button
                onClick={handleOpinionSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionsModal;
