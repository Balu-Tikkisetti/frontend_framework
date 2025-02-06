import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profilePic from "../../assets/unisex-profile-pic.png";
import { searchUsers, searchTopics } from "../../controller/SearchController";
import "../../css/Search.css";
import { useAuth } from "../../context/AuthContext";

// Update interfaces to include isSupported flag
interface Topic {
  id: string;
  text: string;
  location: string;
  userId: number;
  username: string;
  profilePic: string;
}

interface User {
  id: string;
  username: string;
  profilePic?: string;
  isSupported: boolean;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [topicResults, setTopicResults] = useState<Topic[]>([]);
  const [activeSection, setActiveSection] = useState<'all' | 'users' | 'topics'>('all');
  const navigate = useNavigate();

  const { userId } = useAuth();

  const handleLiveSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.trim().length === 0) {
      setUserResults([]);
      setTopicResults([]);
      return;
    }

    try {

      if(!userId){
        return alert("unauthorised");
      }
      // Search users
      const userSearchResults = await searchUsers(searchQuery,userId);
      setUserResults(userSearchResults);
    } catch (error) {
      console.error("❌ Error searching users:", error);
      setUserResults([]);
    }

    try {

      if(!userId){
        return alert("unauthorised");
      }
      // Search topics
      const topicSearchResults = await searchTopics(searchQuery,userId);
      setTopicResults(topicSearchResults);
    } catch (error) {
      console.error("❌ Error searching topics:", error);
      setTopicResults([]);
    }
  };

  const handleSupportClick = async (userId: string, currentStatus: boolean) => {
    try {
      // Add your support/unsupport API call here
      // Update the local state after successful API call
      setUserResults(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isSupported: !currentStatus }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating support status:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      navigate(`/search-results?query=${query}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setUserResults([]);
    setTopicResults([]);
    setActiveSection('all');
  };

  const sections = [
    { id: 'all', label: 'All' },
    { id: 'users', label: 'Users' },
    { id: 'topics', label: 'Topics' },
  ];

  const shouldShowSection = (sectionName: 'users' | 'topics') => {
    return activeSection === 'all' || activeSection === sectionName;
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              placeholder="Search users or topics..."
              value={query}
              onChange={handleLiveSearch}
              className="search-input"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-button"
              >
                ×
              </button>
            )}
          </div>
        </form>

        {query && (
          <div className="search-dropdown">
            <div className="section-tabs">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id as 'all' | 'users' | 'topics')}
                >
                  {section.label}
                  {section.id === 'users' && userResults.length > 0 && 
                    <span className="result-count">{userResults.length}</span>}
                  {section.id === 'topics' && topicResults.length > 0 && 
                    <span className="result-count">{topicResults.length}</span>}
                </button>
              ))}
            </div>

            {/* Users Section with Support Buttons */}
            {shouldShowSection('users') && (
              <div className="search-section">
                <h3 className="section-title">Users</h3>
                {userResults.length > 0 ? (
                  userResults.map((user, index) => (
                    <div key={user.id || `user-${index}`} className="result-item">
                      <div className="result-content">
                        <img
                          src={user.profilePic || profilePic}
                          alt="User"
                          className="result-avatar"
                        />
                        <span className="result-name">@{user.username}</span>
                      </div>
                      <div className="result-actions">
                        <button
                          onClick={() => handleSupportClick(user.id, user.isSupported)}
                          className={`support-button ${!user.isSupported ? 'support' : ''}`}
                        >
                          {user.isSupported ? 'Supported' : 'Support'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No users found</div>
                )}
              </div>
            )}

            {/* Topics Section */}
            {shouldShowSection('topics') && (
              <div className="search-section">
                <h3 className="section-title">Topics</h3>
                {topicResults.length > 0 ? (
                  topicResults.map((topic) => (
                    <div key={topic.id} className="result-item">
                      <div className="result-content">
                        <img
                          src={topic.profilePic || profilePic}
                          alt="Topic Author"
                          className="result-avatar"
                        />
                        <div className="topic-info">
                          <span className="result-name">{topic.text}</span>
                          <span className="topic-meta">
                            Posted by @{topic.username} • {topic.location}
                          </span>
                        </div>
                      </div>
                      <span className="result-meta">Topic</span>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No topics found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;