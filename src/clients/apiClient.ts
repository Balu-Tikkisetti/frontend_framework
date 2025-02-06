import axios from "axios";
import { useAuth } from "../context/AuthContext";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // ✅ Include HttpOnly cookies (Refresh Token)
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // ✅ Try refreshing the token
      try {
        const refreshResponse = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
        if (refreshResponse.data.accessToken) {
          const { fetchUser } = useAuth();
          await fetchUser({ userId: refreshResponse.data.id});
          return apiClient.request(error.config); 
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
