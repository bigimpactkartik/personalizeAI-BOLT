import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthUser, SignupRequest, LoginRequest } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on app load
    const initializeAuth = () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getStoredToken();
        
        if (storedUser && token) {
          setUser(storedUser);
        } else {
          // Clear any partial auth data
          authService.clearAuthData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      const tokenResponse = await authService.login(credentials);
      
      const userData: AuthUser = {
        email: credentials.email,
        uuid: tokenResponse.uuid
      };
      
      setUser(userData);
    } catch (error) {
      // Clear any partial auth data on login failure
      authService.clearAuthData();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupRequest): Promise<{ message: string }> => {
    try {
      setLoading(true);
      return await authService.signup(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user && authService.isAuthenticated(),
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};