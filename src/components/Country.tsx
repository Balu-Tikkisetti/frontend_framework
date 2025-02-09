import { useEffect, useState } from "react";
import "../css/Country.css";
import "../css/TopicCard.css";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";
import axios from "axios";
import CountryTopic from "../model/CountryTopic";
import { fetchCountryTopics } from "../controller/CountryController";
import Search from "./header-components/Search";
import OpinionsModal from "./OpinionsModal";

const Country = () => {
  const [currentLocation, setCurrentLocation] = useState<{ city: string; state: string; country: string } | null>(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const [topics, setTopics] = useState<CountryTopic[]>([]);
  const { userId } = useAuth();

  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState(false);
  const [selectedTopicForOpinions, setSelectedTopicForOpinions] = useState<CountryTopic | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchCurrentLocationDetails(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocationDetected(true);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLocationDetected(true);
    }
  }, []);

  useEffect(() => {
    if (userId && currentLocation) {
      setLocationDetected(true);
      fetchCountryTopics(userId, `${currentLocation.city}, ${currentLocation.state}, ${currentLocation.country}`)
        .then(setTopics)
        .catch((error) => console.error("Error loading topics:", error));
    }
  }, [userId, currentLocation]);

  const openOpinionsModal = (topic: CountryTopic) => {
    setSelectedTopicForOpinions(topic);
    setIsOpinionsModalOpen(true);
  };

  const fetchCurrentLocationDetails = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      if (response.data && response.data.address) {
        setCurrentLocation({
          city: response.data.address.city || response.data.address.town || response.data.address.village || "Unknown",
          state: response.data.address.state || "Unknown",
          country: response.data.address.country || "Unknown",
        });
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
    } finally {
      setLocationDetected(true);
    }
  };

  return (
    <div className="country-page">
      <Search />

      <div className="country-topics-container">
        {!locationDetected ? (
          <p className="text-muted">Detecting your location...</p>
        ) : currentLocation ? (
          <div className="topic-list">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <div key={topic.topicId} className="topic-card">
                  <div className="topic-header">
                    <div className="profile-section">
                      <img
                        src={topic.profilePicture || profilePic}
                        alt="Profile"
                        className="topic-profile-pic"
                      />
                      <span className="topic-username">{topic.username}</span>
                    </div>
                    <span className="topic-location">{topic.location}</span>
                  </div>

                  <p className="topic-text">{topic.text}</p>

                  <div className="topic-actions">
                    <div className="icon-container">
                      <i className="bi bi-chat-square" onClick={() => openOpinionsModal(topic)}></i>
                    </div>
                    <div className="icon-container">
                      <i className="bi bi-send"></i>
                    </div>
                    <div className="icon-container">
                      <i className="bi bi-rocket"></i>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No topics available for your country.</p>
            )}

            {selectedTopicForOpinions && (
              <OpinionsModal
                show={isOpinionsModalOpen}
                onClose={() => setIsOpinionsModalOpen(false)}
                topicText={selectedTopicForOpinions.text}
                topicId={selectedTopicForOpinions.topicId}
                topicImage={selectedTopicForOpinions.topicImage || null}
                username={selectedTopicForOpinions.username}
                userProfilePic={selectedTopicForOpinions.profilePicture || null}
                location={selectedTopicForOpinions.location}
                timestamp={selectedTopicForOpinions.timestamp}
              />
            )}
          </div>
        ) : (
          <p className="text-danger">Unable to fetch location.</p>
        )}
      </div>
    </div>
  );
};

export default Country;