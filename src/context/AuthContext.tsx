import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/apiclient";

interface AuthContextType {
  userId: number | null;
  username: string | null;
  isAuthenticated: boolean;
  fetchUser: (userData?: { userId: number; username: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fetch user details and set them in context
  const fetchUser = async (userData?: { userId: number; username: string }) => {
    try {
      if (userData) {
        // If user data is passed (e.g., from login), use it
        setUserId(userData.userId);
        setUsername(userData.username);
        setIsAuthenticated(true);
      } else {
         console.log("we are waiting for you");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setIsAuthenticated(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {}, { withCredentials: true });
      setUserId(null);
      setUsername(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Automatically fetch user on component mount
  useEffect(() => {
    fetchUser(); // Fetch user details on initial render
  }, []);

  return (
    <AuthContext.Provider value={{ userId, username, isAuthenticated, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
