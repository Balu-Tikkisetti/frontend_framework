import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../api/apiclient";

// Define the context interface for strict typing
interface AuthContextType {
  userId: number | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  location: string | null; // Global location as "City, State, Country"
  fetchUser: (userData?: { userId: number; accessToken?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with an explicit undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:8080/api";

// Define interface for nominatim API response
interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  // Global location state
  const [location, setLocation] = useState<string | null>(null);

  /**
   * Fetch location details using reverse geocoding.
   * This function calls the OpenStreetMap Nominatim API
   * to convert latitude and longitude into a human-readable address.
   */
  const fetchCurrentLocationDetails = async (lat: number, lon: number): Promise<void> => {
    try {
      const response = await axios.get<NominatimResponse>(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      
      if (response.data?.address) {
        const city = response.data.address.city ??
                     response.data.address.town ??
                     response.data.address.village ??
                     "Unknown";
        const state = response.data.address.state ?? "Unknown";
        const country = response.data.address.country ?? "Unknown";
        // Store the combined location details
        setLocation(`${city}, ${state}, ${country}`);
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
      // In case of error, fall back to a default value
      setLocation("Unknown");
    }
  };

  /**
   * Directly retrieve the user's location.
   * The browser will automatically handle any permission prompts.
   */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Retrieved position:", position);
          void fetchCurrentLocationDetails(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error retrieving location:", error);
          setLocation("Unknown");
        }
      );
    } else {
      console.error("❌ Geolocation is not supported by this browser.");
      setLocation("Unknown");
    }
  }, []);

  /**
   * Restore user session once location details have been retrieved.
   * This ensures that session restoration is attempted only when location is available.
   */
  useEffect(() => {
    if (location && !sessionChecked) {
      void fetchUser();
    }
  }, [location, sessionChecked]);

  /**
   * Fetch user details or restore session.
   * If user data is provided (e.g., during login/signup), store it;
   * otherwise, attempt to restore a session via the refresh-token endpoint.
   */
  interface SessionResponse {
    userId: number;
    accessToken: string;
  }

  const fetchUser = async (userData?: { userId: number; accessToken?: string }): Promise<void> => {
    try {
      if (userData) {
        setUserId(userData.userId);
        setAccessToken(userData.accessToken ?? null);
        setIsAuthenticated(true);
        setSessionChecked(true);
      } else {
        console.log("🔄 Attempting session restore...");
        const response = await apiClient.post<SessionResponse>(`${API_BASE_URL}/refresh-token`, {}, { withCredentials: true });
        if (response.data?.userId && response.data?.accessToken) {
          setUserId(response.data.userId);
          setAccessToken(response.data.accessToken);
          setIsAuthenticated(true);
          console.log("✅ Session restored successfully!");
        } else {
          console.log("⚠️ No valid session found.");
        }
        setSessionChecked(true);
      }
    } catch (error) {
      console.error("❌ Failed to restore session:", error);
      setIsAuthenticated(false);
      setSessionChecked(true);
    }
  };

  /**
   * Logout function: clears session information and cookies.
   */
  const logout = async (): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
      setUserId(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      console.log("✅ Logged out successfully!");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  // Tailwind CSS–based responsive loading indicator while waiting for location
  if (!location) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-xl font-semibold">Loading your location...</p>
      </div>
    );
  }

  // Provide the AuthContext value to all children components.
  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, accessToken, location, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 * Ensures that consumers are within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};