import { useEffect, useState } from "react";
import "../css/Country.css";
import "../css/TopicCard.css";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/unisex-profile-pic.png";
import axios from "axios";
import CountryTopic from "../model/CountryTopic"; // ✅ Use CountryTopic model
import { fetchCountryTopics } from "../controller/CountryController"; // ✅ API function
import Search from "./header-components/Search";

const Country = () => {
  const [currentLocation, setCurrentLocation] = useState<{ city: string; state: string; country: string } | null>(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const [topics, setTopics] = useState<CountryTopic[]>([]);
  const { userId } = useAuth(); // ✅ Authenticated user

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
      {/* Search Container */}
      <Search />

      {/* Country Topics Container */}
      <div className="country-topics-container ">
        {!locationDetected ? (
          <p className="text-muted">Detecting your location...</p>
        ) : currentLocation ? (
          <>

            {/* ✅ Display Topics */}
            <div className="topic-list">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <div key={topic.topicId} className="topic-card">
                    {/* Profile Section */}
                    <div className="topic-header">
                      <div className="profile-section">
                        <img
                          src={topic.profilePicture || profilePic}
                          alt="Profile"
                          className="topic-profile-pic "
                        />
                        <span className="topic-username">{topic.username}</span>
                      </div>
                      <span className="topic-location">{topic.location}</span>
                    </div>

                    {/* Topic Text */}
                    <p className="topic-text">{topic.text}</p>

                    {/* Topic Actions */}
                    <div className="topic-actions">
                    
                    <div className="icon-container">
                        <i className="bi bi-chat-square"></i>
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
            </div>
          </>
        ) : (
          <p className="text-danger">Unable to fetch location.</p>
        )}
      </div>
    </div>
  );
};

export default Country;
