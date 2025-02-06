import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/search";



// ✅ Full Search for Users
export const searchUsers = async (query: string,userId:number) => {
  let currentUserId=userId;
  try {
    const response = await axios.get(`${API_BASE_URL}/searchusers`, {
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
    const response = await axios.get(`${API_BASE_URL}/topics`, {
      params: { query,currentUserId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error searching topics:", error);
    return [];
  }
};
