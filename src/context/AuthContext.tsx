import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/apiclient";

interface AuthContextType {
  userId: number | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  fetchUser: (userData?: { userId: number; accessToken?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false); // ✅ Ensures we only check once

  // ✅ Fetch user details & Restore Session if Token Exists
  const fetchUser = async (userData?: { userId: number; accessToken?: string }) => {
    try {
      if (userData) {
        // ✅ If user logs in/signs up, store details directly
        setUserId(userData.userId);
        setAccessToken(userData.accessToken || null);
        setIsAuthenticated(true);
        setSessionChecked(true); // ✅ Mark session as checked after login/signup
      } else if (sessionChecked) {
        // ✅ Try session restore only if it hasn't been checked before
        console.log("🔄 Attempting session restore...");
        const response = await apiClient.post("/auth/refresh-token", {}, { withCredentials: true });

        if (response.data.userId && response.data.accessToken) {
          setUserId(response.data.userId);
          setAccessToken(response.data.accessToken);
          setIsAuthenticated(true);
          console.log("✅ Session restored successfully!");
        } else {
          console.log("⚠️ No valid session found.");
        }
      }
    } catch (error) {
      console.error("❌ Failed to restore session:", error);
      setIsAuthenticated(false);
    } finally {
      setSessionChecked(true); // ✅ Mark session as checked to prevent re-checking
    }
  };

  // ✅ Logout function: Clears session and JWT cookies
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {}, { withCredentials: true });
      setUserId(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      console.log("✅ Logged out successfully!");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  // ✅ Restore session only if not checked before
  useEffect(() => {
    if (!sessionChecked) {
      fetchUser();
    }
  }, [sessionChecked]);

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, accessToken, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
