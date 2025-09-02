import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type (adjust based on your backend response)
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  username: string;
  userType?: 'customer' | 'service_provider';
  subscriptionTier?: 'Basic' | 'Professional' | 'Enterprise';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check for saved authentication on app start
    const savedUser = localStorage.getItem('maintenanceManager_user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('maintenanceManager_user');
        localStorage.removeItem('token');
        setAuthState({ isAuthenticated: false, user: null, loading: false });
      }
    } else {
      setAuthState({ isAuthenticated: false, user: null, loading: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed');
        return false;
      }

      const { token, user } = await response.json();

      if (!token || !user) {
        console.error('Invalid login response');
        return false;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('maintenanceManager_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    localStorage.removeItem('token');
    localStorage.removeItem('maintenanceManager_user');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
