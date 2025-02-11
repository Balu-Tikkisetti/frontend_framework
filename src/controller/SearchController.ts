import axios from "axios";
import { query } from "firebase/database";

const API_BASE_URL = "http://localhost:8080/api";



// ✅ Full Search for Users
export const searchUsers = async (query: string,userId:number) => {
  let currentUserId=userId;
  try {
    const response = await axios.get(`${API_BASE_URL}/search/searchusers`, {
      params: { query,currentUserId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error searching users:", error);
    return [];
  }
};

// ✅ Full Search for Topics
export const searchTopics = async (query: string,userId:number) => {
  let currentUserId=userId;
  try {
    const response = await axios.get(`${API_BASE_URL}/search/topics`, {
      params: { query,currentUserId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error searching topics:", error);
    return [];
  }
};



export const updateSupported = async (userId: number, supportedUserId: number) => {
  try {
    await axios.post(`${API_BASE_URL}/support/${userId}/add/${supportedUserId}`);
    console.log(`✅ User ${userId} is now supporting ${supportedUserId}`);
    return true; // ✅ Return success status
  } catch (error) {
    console.error("❌ Error while supporting:", error);
    return false;
  }
};

export const deleteSupport = async (userId: number, supportedUserId: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/support/${userId}/remove/${supportedUserId}`);
    console.log(`✅ User ${userId} has stopped supporting ${supportedUserId}`);
    return true; // ✅ Return success status
  } catch (error) {
    console.error("❌ Error while removing support:", error);
    return false;
  }
};



export const searchUserViewDetails = async (userId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/user-details/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user view details:", error);
    throw error;
  }
};



export const sendMessageRequest = async (senderId: number, recipientId: number) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/message/message-request/${senderId}/sent/${recipientId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message request:", error);
    throw error;
  }
};


