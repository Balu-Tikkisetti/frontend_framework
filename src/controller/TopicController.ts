// src/controller/TopicController.ts
import axios from "axios";
import Topic from "../model/Topic";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api"; // Update with actual deployment URL


export const fetchUserTopics = async (userId: number): Promise<Topic[]> => {
  try {
    
    if (!userId) throw new Error("User not authenticated");

    const response = await axios.get(`${API_BASE_URL}/topics/fetchtopics`, {
        params: { userId }, // ✅ Send as query parameter
        
      });

    if (!response.data || response.data.length === 0) {
      console.warn("No topics found for the user.");
      return [];
    }

    return response.data.map(
      (topic: any) =>
        new Topic(topic.id, topic.text, topic.location, topic.timestamp, topic.topicImage)
    );
  } catch (error) {
    console.error("Error fetching user topics:", error);
    return [];
  }
};


export const createNewTopic = async (userId: number,text: string, location: string, topicImage?: File): Promise<Topic | null> => {
  try {
    
    if (!userId) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append("userId", userId.toString());
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


export const deleteTopic = async (userId: number, topicId: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/topics/deletetopic`, {
      params: { userId, topicId }, // ✅ Ensure correct parameters
      withCredentials: true, // ✅ Send JWT if required
    });

    if (response.status === 200) {
      console.log("Topic deleted successfully!");
    } else {
      throw new Error("Failed to delete topic.");
    }
  } catch (error) {
    console.error("Error deleting topic:", error);
    throw error;
  }
};
