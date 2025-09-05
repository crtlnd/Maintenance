import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, NotificationPreferences, SubscriptionPlan, ServiceProviderPlan, UserType } from '../types';
import { teamApi, organizationApi } from '../../services/teamApi.js';

interface OrganizationData {
  id: string;
  name: string;
  type: string;
  settings: {
    allowExternalAccess: boolean;
    dataSharing: {
      assets: boolean;
      maintenance: boolean;
    };
  };
  memberCount?: number;
  assetCount?: number;
}

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

  // NEW: Organization functions
  organization: OrganizationData | null;
  loadOrganization: () => Promise<void>;
  createOrganization: (name: string, type?: string) => Promise<boolean>;
  updateOrganizationSettings: (name: string, settings: any) => Promise<boolean>;
  leaveOrganization: () => Promise<boolean>;

  // NEW: Team management functions
  isOrganizationOwner: () => boolean;
  canInviteMembers: () => boolean;
  hasOrganization: () => boolean;
  getOrganizationRole: () => string;
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

  const [organization, setOrganization] = useState<OrganizationData | null>(null);

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
          // Load organization data if user has one
          if (user.organizationId) {
            loadOrganization();
          }
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

      // Load organization data if user has one
      if (user.organizationId) {
        await loadOrganization();
      }

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
    setOrganization(null);
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

  // NEW: Organization functions
  const loadOrganization = async (): Promise<void> => {
    try {
      const response = await organizationApi.getOrganizationInfo();
      if (response.success) {
        setOrganization({
          id: response.data.organization.id,
          name: response.data.organization.name,
          type: response.data.organization.type,
          settings: response.data.organization.settings,
          memberCount: response.data.stats?.memberCount,
          assetCount: response.data.stats?.assetCount,
        });
      }
    } catch (error) {
      console.error('Error loading organization:', error);
    }
  };

  const createOrganization = async (name: string, type: string = 'internal'): Promise<boolean> => {
    try {
      const response = await organizationApi.createOrganization(name, type);
      if (response.success) {
        // Update user data
        const updatedUser = {
          ...authState.user!,
          organizationId: response.data.organization.id,
          organizationRole: 'owner',
          subscriptionTier: 'Professional' as SubscriptionPlan,
        };

        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));
        localStorage.setItem('maintenanceManager_user', JSON.stringify(updatedUser));

        // Set organization data
        setOrganization({
          id: response.data.organization.id,
          name: response.data.organization.name,
          type: response.data.organization.type,
          settings: response.data.organization.settings,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating organization:', error);
      return false;
    }
  };

  const updateOrganizationSettings = async (name: string, settings: any): Promise<boolean> => {
    try {
      const response = await organizationApi.updateSettings(name, settings);
      if (response.success) {
        setOrganization(prev => prev ? {
          ...prev,
          name: response.data.organization.name,
          settings: response.data.organization.settings,
        } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating organization settings:', error);
      return false;
    }
  };

  const leaveOrganization = async (): Promise<boolean> => {
    try {
      const response = await organizationApi.leaveOrganization();
      if (response.success) {
        // Update user data
        const updatedUser = {
          ...authState.user!,
          organizationId: null,
          organizationRole: 'technician',
          subscriptionTier: 'Basic' as SubscriptionPlan,
        };

        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));
        localStorage.setItem('maintenanceManager_user', JSON.stringify(updatedUser));

        // Clear organization data
        setOrganization(null);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error leaving organization:', error);
      return false;
    }
  };

  // NEW: Team management helper functions
  const isOrganizationOwner = (): boolean => {
    return authState.user?.organizationRole === 'owner' || false;
  };

  const canInviteMembers = (): boolean => {
    return isOrganizationOwner();
  };

  const hasOrganization = (): boolean => {
    return !!authState.user?.organizationId;
  };

  const getOrganizationRole = (): string => {
    return authState.user?.organizationRole || 'technician';
  };

  // Updated team member functions to use organization role
  const canAddTeamMember = (): boolean => {
    if (!authState.user || authState.user.userType === 'service_provider') return false;
    return isOrganizationOwner();
  };

  const canAddAsset = (currentAssetCount: number): boolean => {
    console.log('DEBUG canAddAsset:', {
      hasUser: !!authState.user,
      userType: authState.user?.userType,
      subscriptionTier: authState.user?.subscriptionTier,
      currentAssetCount,
      result: authState.user && authState.user.userType !== 'service_provider' && (authState.user.subscriptionTier !== 'Basic' || currentAssetCount < 5)
    });

    if (!authState.user || authState.user.userType === 'service_provider') return false;
    return authState.user.subscriptionTier !== 'Basic' || currentAssetCount < 5;
  };

  const getAssetLimit = (): number | 'unlimited' => {
    console.log('DEBUG getAssetLimit:', {
      hasUser: !!authState.user,
      userType: authState.user?.userType,
      subscriptionTier: authState.user?.subscriptionTier,
      user: authState.user
    });

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

        // NEW: Organization context
        organization,
        loadOrganization,
        createOrganization,
        updateOrganizationSettings,
        leaveOrganization,

        // NEW: Team management
        isOrganizationOwner,
        canInviteMembers,
        hasOrganization,
        getOrganizationRole,
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
