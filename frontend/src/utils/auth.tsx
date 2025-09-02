import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, NotificationPreferences, SubscriptionPlan, ServiceProviderPlan, UserType } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, signal?: AbortSignal) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
    role: string;
    username: string;
    consent: boolean;
    userType?: UserType;
    plan?: ServiceProviderPlan | SubscriptionPlan;
    businessInfo?: any;
  }, signal?: AbortSignal) => Promise<{ success: boolean; token?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateNotificationPreferences: (preferences: NotificationPreferences) => void;
  canAddAsset: (currentAssetCount: number) => boolean;
  canAddTeamMember: () => boolean;
  getAssetLimit: () => number | 'unlimited';
  getSeatLimit: () => number | 'unlimited';
  upgradePlan: (plan: SubscriptionPlan | ServiceProviderPlan, signal?: AbortSignal) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const defaultNotificationPreferences: NotificationPreferences = {
  maintenanceDue: true,
  maintenanceOverdue: true,
  assetFailures: true,
  highRiskFMEA: true,
  taskAssignments: true,
  systemUpdates: false,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  digestFrequency: 'daily',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('maintenanceManager_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && typeof user === 'object') {
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
          });
        } else {
          throw new Error('Invalid user data');
        }
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

  const login = async (email: string, password: string, signal?: AbortSignal): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', errorData.error || 'Unknown error');
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
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Login error:', error.message);
      }
      return false;
    }
  };

  const signup = async (
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      company: string;
      role: string;
      username: string;
      consent: boolean;
      userType?: UserType;
      plan?: ServiceProviderPlan | SubscriptionPlan;
      businessInfo?: any;
    },
    signal?: AbortSignal
  ): Promise<{ success: boolean; token?: string }> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Signup failed:', errorData.error || 'Unknown error');
        return { success: false };
      }
      const { token, user } = await response.json();
      if (!token || !user) {
        console.error('Invalid signup response');
        return { success: false };
      }
      localStorage.setItem('token', token);
      localStorage.setItem('maintenanceManager_user', JSON.stringify(user));
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });
      return { success: true, token };
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Signup error:', error.message);
      }
      return { success: false };
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

  const updateProfile = (updates: Partial<User>) => {
    if (!authState.user) return;
    const updatedUser = { ...authState.user, ...updates };
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    localStorage.setItem('maintenanceManager_user', JSON.stringify(updatedUser));
  };

  const updateNotificationPreferences = (preferences: NotificationPreferences) => {
    if (!authState.user) return;
    const updatedUser = {
      ...authState.user,
      notificationPreferences: preferences,
    };
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    localStorage.setItem('maintenanceManager_user', JSON.stringify(updatedUser));
  };

  const canAddAsset = (currentAssetCount: number): boolean => {
    if (!authState.user || authState.user.userType === 'service_provider') return false;
    return authState.user.subscriptionTier !== 'Basic' || currentAssetCount < 5;
  };

  const canAddTeamMember = (): boolean => {
    if (!authState.user || authState.user.userType === 'service_provider') return false;
    return authState.user.subscriptionTier !== 'Basic';
  };

  const getAssetLimit = (): number | 'unlimited' => {
    if (!authState.user || authState.user.userType === 'service_provider') return 0;
    return authState.user.subscriptionTier === 'Basic' ? 5 : 'unlimited';
  };

  const getSeatLimit = (): number | 'unlimited' => {
    if (!authState.user || authState.user.userType === 'service_provider') return 0;
    return authState.user.subscriptionTier === 'Basic' ? 1 : 'unlimited';
  };

  const upgradePlan = async (plan: SubscriptionPlan | ServiceProviderPlan, signal?: AbortSignal): Promise<boolean> => {
    if (!authState.user) return false;
    try {
      const response = await fetch('http://localhost:3000/api/users/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ plan }),
        signal,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upgrade failed:', errorData.error || 'Unknown error');
        return false;
      }
      const { url } = await response.json();
      if (!url) {
        console.error('Invalid upgrade response');
        return false;
      }
      window.location.href = url;
      return true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Upgrade plan error:', error.message);
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        updateProfile,
        updateNotificationPreferences,
        canAddAsset,
        canAddTeamMember,
        getAssetLimit,
        getSeatLimit,
        upgradePlan,
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
