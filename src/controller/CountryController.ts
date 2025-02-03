import axios from "axios";
import CountryTopic from "../model/CountryTopic"; // ✅ Import the correct model

const API_BASE_URL = "http://localhost:8080/api"; // ✅ Base API URL

// Fetch country-specific topics
export const fetchCountryTopics = async (
  userId: number,
  currentLocation: string
): Promise<CountryTopic[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/topics/getCountryTopicsByUserId`, {
      params: { userId, currentLocation }, // ✅ Ensure correct parameter naming
    });

    // ✅ Convert response data into `CountryTopic` instances
    return response.data.map(
      (topic: any) =>
        new CountryTopic(
          topic.topicId, // ✅ Use correct field name from backend DTO
          topic.userId,
          topic.username,
          topic.profilePicture || null, // ✅ Handle null profile picture
          topic.text,
          topic.location,
          topic.timestamp,
          topic.topicImage || null // ✅ Handle null topic image
        )
    );
  } catch (error) {
    console.error("Error fetching country topics:", error);
    throw new Error("Failed to fetch country topics. Please try again.");
  }
};
