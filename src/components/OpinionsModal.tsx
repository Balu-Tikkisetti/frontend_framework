import React, { useState, useEffect } from "react";
import "../css/Modals/OpinionsModal.css";
import profilePic from "../assets/unisex-profile-pic.png"; // Default profile picture
import { useAuth } from "../context/AuthContext";
import { fetchOpinions, addOpinion } from "../controller/OpinionController";

interface OpinionsModalProps {
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

interface Opinion {
  username: string;
  userProfilePic: string | null;
  opinionText: string;
  timestamp: string;
}

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
  const [newOpinion, setNewOpinion] = useState("");
  const { userId } = useAuth();

  // ✅ Fetch opinions when modal opens
  useEffect(() => {
    if (show) {
      fetchOpinions(topicId)
        .then(setOpinions)
        .catch((error) => console.error(error.message));
    }
  }, [show, topicId]);

  // ✅ Handle opinion submission
  const handleOpinionSubmit = async () => {
    if (!newOpinion.trim()) return;
    if (!userId) {
      alert("⚠️ You must be logged in to add an opinion.");
      return;
    }

    try {
      await addOpinion(userId, topicId, newOpinion);

      // ✅ Optimistically update UI
      setOpinions((prev) => [
        {
          username: username,
          userProfilePic: userProfilePic || null,
          opinionText: newOpinion,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNewOpinion(""); // ✅ Clear input
    } catch (error) {
      alert("⚠️ Failed to add opinion. Try again.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block opinions-modal" tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Opinions</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h5>Topic</h5>
            <p>@ {topicText}</p>
            {topicImage && <img src={topicImage} alt="Topic" className="img-fluid rounded" />}

            <h5>Opinions</h5>
            {opinions.length > 0 ? (
              opinions.map((opinion, index) => (
                <div key={index} className="opinion-item">
                  <img src={opinion.userProfilePic || profilePic} alt="User" className="opinion-profile-pic" />
                  <div className="opinion-content">
                    <span className="opinion-username">{opinion.username}</span>
                    <p className="opinion-text">{opinion.opinionText}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No opinions yet.</p>
            )}
          </div>

          {/* Opinion Input Field */}
          <div className="opinion-input-container">
            <input
              type="text"
              className="opinion-input"
              placeholder="Write your opinion..."
              value={newOpinion}
              onChange={(e) => setNewOpinion(e.target.value)}
            />
            <button className="send-opinion-btn" onClick={handleOpinionSubmit}>
              <i className="bi bi-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionsModal;
