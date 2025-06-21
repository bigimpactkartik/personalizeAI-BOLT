import apiClient from './api';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  uuid: string;
}

export interface AuthUser {
  email: string;
  uuid: string;
}

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signup(userData: SignupRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/signup', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    try {
      const response = await apiClient.post('/login', credentials);
      const tokenData: TokenResponse = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', tokenData.access_token);
      localStorage.setItem('auth_user', JSON.stringify({
        email: credentials.email,
        uuid: tokenData.uuid
      }));
      
      return tokenData;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed, but continuing with local cleanup');
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  getStoredUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem('auth_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export default AuthService.getInstance();