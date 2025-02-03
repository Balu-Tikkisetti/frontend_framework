// src/controller/ProfileController.ts
import axios from "axios";
import UserProfile from "../model/Userprofile"; // Ensure correct import
import profilePic from "../assets/dummy.png";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api"; // Change this for deployment




export const fetchProfileData = async (userId: number): Promise<UserProfile> => {
  try {
    if (!userId) throw new Error("User ID is missing");

    const response = await axios.get(`${API_BASE_URL}/profile`, {
        params: { userId }, // ✅ Send as query parameter
       
      });
    const data = response.data;
    
    // Map API response to UserProfile model
    return new UserProfile(
      data.username || "Anonymous",
      data.gmail || "N/A",
      data.gender || "N/A",
      data.dob || "N/A",
      data.profilePicture || profilePic, // Fallback to default
      data.supportersCount || 0,
      data.supportedCount || 0
    );
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};



