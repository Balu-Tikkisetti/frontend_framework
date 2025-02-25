import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/upvotes";

// Define return types for API responses
interface UpvoteResponse {
  success: boolean;
  message: string;
}



// ✅ Add an upvote
export const addUpvote = async (userId: number, topicId: string): Promise<UpvoteResponse> => {
  try {
    const formData = new FormData();
    formData.append("userId", userId.toString()); // ✅ Convert to string for FormData
    formData.append("topicId", topicId);

    const response = await axios.post<UpvoteResponse>(`${API_BASE_URL}/add`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // ✅ Return typed response
  } catch (error) {
    console.error("❌ Error adding upvote:", error);
    throw new Error("Failed to add upvote.");
  }
};

// ✅ Remove an upvote (downvote)
export const removeUpvote = async (userId: number, topicId: string): Promise<UpvoteResponse> => {
  try {
    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("topicId", topicId);
    
    const response = await axios.delete<UpvoteResponse>(`${API_BASE_URL}/remove`, {
      data: formData, // ✅ Correct way to send FormData in DELETE request
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return response.data; // ✅ Return typed response
  } catch (error) {
    console.error("❌ Error removing upvote:", error);
    throw new Error("Failed to remove upvote.");
  }
};

// ✅ Get upvote count for a topic
export const getUpvoteCount = async (topicId: string): Promise<number> => {
  try {
    const response = await axios.get<number>(`${API_BASE_URL}/count`, {
      params: { topicId }, // ✅ Correct way to send topicId
    });
    
    return response.data; // ✅ Return typed response
  } catch (error) {
    console.error("❌ Error fetching upvote count:", error);
    return 0; // ✅ Return 0 on failure
  }
};

// ✅ Check if user has upvoted a topic
export const hasUserUpvoted = async (userId: number, topicId: string): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(`${API_BASE_URL}/hasUpvoted`, {
      params: { userId, topicId }, // ✅ Send as query parameters
    });
    
    return response.data; // ✅ Return typed response
  } catch (error) {
    console.error("❌ Error checking upvote status:", error);
    return false; // ✅ Return false on failure
  }
};