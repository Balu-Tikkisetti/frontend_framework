import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/opinions";

// ✅ Fetch opinions for a topic
export const fetchOpinions = async (topicId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get`, {
      params: { topicId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching opinions:", error);
    throw new Error("Failed to fetch opinions.");
  }
};

// ✅ Add a new opinion (FormData)
export const addOpinion = async (userId: number, topicId: string, opinionText: string) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId.toString()); // Convert number to string
      formData.append("topicId", topicId);
      formData.append("opinionText", opinionText);
  
      const response = await axios.post(`${API_BASE_URL}/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ Required for FormData
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("❌ Error adding opinion:", error);
      throw new Error("Failed to add opinion.");
    }
  };
  
