import axios from "axios";
import Topic from "../model/Topic";

const API_BASE_URL = "http://localhost:8080/api"; // Update with your actual deployment URL

/**
 * Fetch topics created by the user.
 */
export const fetchUserTopics = async (userId: number): Promise<Topic[]> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const response = await axios.get(`${API_BASE_URL}/topics/fetchtopics`, {
      params: { userId },
    });

    if (!response.data || response.data.length === 0) {
      console.warn("No topics found for the user.");
      return [];
    }

    return response.data.map((topic: any) => new Topic(
      topic.id,                // id
      topic.annotate,          // annotate
      topic.text,              // text
      topic.location,          // location
      topic.timestamp,         // timestamp
      topic.userId,            // userId
      topic.username,          // username
      topic.profilePicture,    // profilePicture
      topic.topicImageUrl      // topicImageUrl
    ));
  } catch (error) {
    console.error("Error fetching user topics:", error);
    return [];
  }
};

/**
 * Fetch global topics.
 */
export const fetchGlobalTopics = async (userId: number, location: string): Promise<Topic[]> => {
  try {
    if (!userId) throw new Error("User not authenticated");
    let currentLocation=location;
    const response = await axios.get(`${API_BASE_URL}/topics/getGlobalTopicsByUserId`, {
      params: { userId, currentLocation },
    });

    if (!response.data || response.data.length === 0) {
      console.warn("No global topics found.");
      return [];
    }

    return response.data.map((topic: any) => new Topic(
      topic.id,
      topic.annotate,
      topic.text,
      topic.location,
      topic.timestamp,
      topic.userId,
      topic.username,
      topic.profilePicture,
      topic.topicImageUrl
    ));
  } catch (error) {
    console.error("Error fetching global topics:", error);
    return [];
  }
};

/**
 * Fetch country-specific topics.
 */
export const fetchCountryTopics = async (userId: number, location: string): Promise<Topic[]> => {
  try {
    if (!userId) throw new Error("User not authenticated");
    let currentLocation=location;
    const response = await axios.get(`${API_BASE_URL}/topics/getCountryTopicsByUserId`, {
      params: { userId, currentLocation },
    });

    if (!response.data || response.data.length === 0) {
      console.warn("No country topics found.");
      return [];
    }

    return response.data.map((topic: any) => new Topic(
      topic.id,
      topic.annotate,
      topic.text,
      topic.location,
      topic.timestamp,
      topic.userId,
      topic.username,
      topic.profilePicture,
      topic.topicImageUrl
    ));
  } catch (error) {
    console.error("Error fetching country topics:", error);
    return [];
  }
};

/**
 * Fetch community topics.
 */
export const fetchCommunityTopics = async (userId: number, location: string): Promise<Topic[]> => {
  try {
    if (!userId) throw new Error("User not authenticated");
    let currentLocation=location;
    const response = await axios.get(`${API_BASE_URL}/topics/getCommunityTopicsByUserId`, {
      params: { userId, currentLocation },
    });

    if (!response.data || response.data.length === 0) {
      console.warn("No community topics found.");
      return [];
    }

    return response.data.map((topic: any) => new Topic(
      topic.id,
      topic.annotate,
      topic.text,
      topic.location,
      topic.timestamp,
      topic.userId,
      topic.username,
      topic.profilePicture,
      topic.topicImageUrl
    ));
  } catch (error) {
    console.error("Error fetching community topics:", error);
    return [];
  }
};

/**
 * Fetch trending topics.
 */
export const fetchTrendingTopics = async (userId: number, location: string): Promise<Topic[]> => {
  try {
    if (!userId) throw new Error("User not authenticated");
    let currentLocation=location;
    const response = await axios.get(`${API_BASE_URL}/topics/getTrendingTopicsByUserId`, {
      params: { userId, currentLocation },
    });

    if (!response.data || response.data.length === 0) {
      console.warn("No trending topics found.");
      return [];
    }

    return response.data.map((topic: any) => new Topic(
      topic.id,
      topic.annotate,
      topic.text,
      topic.location,
      topic.timestamp,
      topic.userId,
      topic.username,
      topic.profilePicture,
      topic.topicImageUrl
    ));
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return [];
  }
};

/**
 * Create a new topic.
 */
export const createNewTopic = async (
  userId: number,
  annotate: string,
  text: string,
  location: string,
  topicImage?: File
): Promise<Topic | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("annotate", annotate);
    formData.append("text", text);
    formData.append("location", location);
    if (topicImage) formData.append("topicImage", topicImage);

    const response = await axios.post(`${API_BASE_URL}/topics/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Topic created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating topic:", error);
    return null;
  }
};

/**
 * Delete a topic.
 */
export const deleteTopic = async (userId: number, topicId: string): Promise<void> => {
  try {
    if (!userId || !topicId) {
      throw new Error("Missing userId or topicId. Deletion aborted.");
    }

    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("topicId", topicId);

    const response = await axios.delete(`${API_BASE_URL}/topics/deleteTopic`, {
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200) {
      console.log("✅ Topic deleted successfully!");
    } else {
      throw new Error("Failed to delete topic.");
    }
  } catch (error) {
    console.error("Error deleting topic:", error);
    throw error;
  }
};
