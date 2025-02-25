// src/controller/ProfileController.ts
import axios, { AxiosResponse } from "axios";
import UserProfile from "../model/Userprofile"; // Ensure correct import
import profilePic from "../assets/dummy.png";
// Remove unused import
// import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api"; // Change this for deployment

// Define the API response interface
interface ProfileResponse {
  username: string;
  gmail: string;
  password: string;
  dob: string;
  gender: string;
  profilePicture: string | null;
  phoneNumber: string;
  supportersCount: number;
  supportedCount: number;
}

export const fetchProfileData = async (userId: number): Promise<UserProfile> => {
  try {
    if (!userId) throw new Error("User ID is missing");

    const response: AxiosResponse<ProfileResponse> = await axios.get(`${API_BASE_URL}/profile`, {
      params: { userId }, // ✅ Send as query parameter
    });
    
    const data = response.data;
    
    // Map API response to UserProfile model
    return new UserProfile(
      data.username || "Anonymous",
      data.gmail || "N/A",
      data.password || "N/A",
      data.dob || "N/A",
      data.gender || "N/A",
      data.profilePicture || profilePic,
      data.phoneNumber || "N/A",
      data.supportersCount || 0,
      data.supportedCount || 0
    );
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    if (!userId) throw new Error("User ID is missing");

    const response = await axios.delete(`${API_BASE_URL}/deleteuser`, {
      params: { userId }, // ✅ Send userId as query parameter
    });

    if (response.status === 200) {
      console.log("✅ User deleted successfully!");
    } else {
      throw new Error(" Failed to delete user.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};