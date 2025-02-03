import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api", // Your backend API base URL
  withCredentials: true, // Automatically include cookies in requests
});

export default apiClient;
