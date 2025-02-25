import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Define response interface for refresh token endpoint
interface RefreshTokenResponse {
  accessToken: string;
  id: number;
}

// Create an authentication service singleton that can be used outside of React components
class AuthService {
  private static instance: AuthService;
  private userFetchCallback: ((userData: { userId: number }) => Promise<void>) | null = null;
  private redirectToLogin: () => void = () => { window.location.href = "/login"; };

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setUserFetchCallback(callback: (userData: { userId: number }) => Promise<void>): void {
    this.userFetchCallback = callback;
  }

  public async refreshUserSession(userId: number): Promise<void> {
    if (this.userFetchCallback) {
      await this.userFetchCallback({ userId });
    }
  }

  public navigateToLogin(): void {
    this.redirectToLogin();
  }
}

const authService = AuthService.getInstance();

// Create API client
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // ✅ Include HttpOnly cookies (Refresh Token)
});

// Add response interceptor with proper type definitions
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Type guard to check for response property
    if (error.response?.status === 401) {
      // ✅ Try refreshing the token
      try {
        const refreshResponse = await axios.post<RefreshTokenResponse>(
          "http://localhost:8080/api/refresh-token", 
          {}, 
          { withCredentials: true }
        );
        
        if (refreshResponse.data.accessToken) {
          // Use the auth service instead of the hook
          await authService.refreshUserSession(refreshResponse.data.id);
          
          // Make sure config exists and retry the request
          const config = error.config as AxiosRequestConfig;
          if (config) {
            return apiClient.request(config);
          }
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        authService.navigateToLogin();
      }
    }
    return Promise.reject(error);
  }
);

// Hook connector to link the auth context with our singleton service
export const connectAuthToApiClient = (
  fetchUserCallback: (userData: { userId: number }) => Promise<void>
): void => {
  authService.setUserFetchCallback(fetchUserCallback);
};

export default apiClient;