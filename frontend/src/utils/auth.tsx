import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, NotificationPreferences, SubscriptionPlan, ServiceProviderPlan, TeamMember, Organization, UserType, ServiceProviderProfile } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
    role: string;
    userType?: UserType;
    plan?: ServiceProviderPlan | SubscriptionPlan;
    businessInfo?: any;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateNotificationPreferences: (preferences: NotificationPreferences) => void;
  canAddAsset: (currentAssetCount: number) => boolean;
  canAddTeamMember: () => boolean;
  getAssetLimit: () => number | 'unlimited';
  getSeatLimit: () => number | 'unlimited';
  upgradePlan: (plan: SubscriptionPlan | ServiceProviderPlan) => Promise<boolean>;
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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('maintenanceManager_user');
    if (savedUser) {
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
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would validate against a backend
    if (email && password.length >= 6) {
      let user: User;

      // Create admin user for testing
      if (email === 'admin@maintenancemanager.com') {
        user = {
          id: 'admin_001',
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'System Administrator',
          company: 'Maintenance Manager Inc.',
          department: 'Administration',
          phone: '+1 (555) 999-0000',
          userType: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          notificationPreferences: defaultNotificationPreferences,
          subscription: {
            plan: 'ai-powered',
            status: 'active',
            assetLimit: 'unlimited',
            seatLimit: 'unlimited',
          },
        };
      } else if (email === 'demo@ai-powered.com') {
        // Special demo user with AI-powered plan for testing
        user = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'Maintenance Manager',
          company: 'Industrial Solutions Inc.',
          department: 'Maintenance',
          phone: '+1 (555) 123-4567',
          userType: 'customer',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          notificationPreferences: defaultNotificationPreferences,
          subscription: {
            plan: 'ai-powered',
            status: 'active',
            assetLimit: 'unlimited',
            seatLimit: 1,
          },
        };
      } else {
        // Default demo user starts with free plan to demonstrate upgrade flow
        user = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'Maintenance Manager',
          company: 'Industrial Solutions Inc.',
          department: 'Maintenance',
          phone: '+1 (555) 123-4567',
          userType: 'customer',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          notificationPreferences: defaultNotificationPreferences,
          subscription: {
            plan: 'free',
            status: 'active',
            assetLimit: 5,
            seatLimit: 1,
          },
        };
      }

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });

      localStorage.setItem('maintenanceManager_user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const signup = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
    role: string;
    userType?: UserType;
    plan?: ServiceProviderPlan | SubscriptionPlan;
    businessInfo?: any;
  }): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userType = userData.userType || 'customer';
    let user: User;

    if (userType === 'service_provider') {
      const selectedPlan = (userData.plan as ServiceProviderPlan) || 'verified';
      
      // Set features based on selected plan
      const serviceProviderFeatures = {
        verified: { isVerified: true, canDirectMessage: false, isPromoted: false },
        premium: { isVerified: true, canDirectMessage: true, isPromoted: false },
        promoted: { isVerified: true, canDirectMessage: true, isPromoted: true },
      };

      const features = serviceProviderFeatures[selectedPlan];

      const serviceProviderProfile: ServiceProviderProfile = {
        id: Math.random().toString(36).substr(2, 9),
        businessName: userData.company,
        owner: userData.email,
        subscription: {
          plan: selectedPlan,
          status: 'active',
        },
        businessInfo: {
          type: userData.businessInfo?.type || 'independent',
          services: userData.businessInfo?.services || [],
          specializations: [],
          address: userData.businessInfo?.address || '',
          phone: userData.businessInfo?.phone || '',
          website: userData.businessInfo?.website,
          certifications: userData.businessInfo?.certifications || [],
          responseTime: '24 hours',
          availability: 'business-hours',
          pricing: 'mid-range',
        },
        ...features,
      };

      user = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        company: userData.company,
        userType: 'service_provider',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        notificationPreferences: defaultNotificationPreferences,
        serviceProviderProfile,
        subscription: {
          plan: selectedPlan,
          status: 'active',
        },
      };
    } else {
      const selectedPlan = (userData.plan as SubscriptionPlan) || 'free';
      
      // Set limits based on selected plan
      let assetLimit: number | 'unlimited';
      let seatLimit: number | 'unlimited';

      switch (selectedPlan) {
        case 'pro':
          assetLimit = 'unlimited';
          seatLimit = 1;
          break;
        case 'ai-powered':
          assetLimit = 'unlimited';
          seatLimit = 1;
          break;
        default:
          assetLimit = 5;
          seatLimit = 1;
      }

      const organization: Organization = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.company,
        owner: userData.email,
        members: [],
        subscription: {
          plan: selectedPlan,
          status: 'active',
          assetLimit,
          seatLimit,
          usedSeats: 1,
        }
      };

      user = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        company: userData.company,
        userType: 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        notificationPreferences: defaultNotificationPreferences,
        organization,
        subscription: {
          plan: selectedPlan,
          status: 'active',
          assetLimit,
          seatLimit,
        },
      };
    }

    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
    });

    localStorage.setItem('maintenanceManager_user', JSON.stringify(user));
    return true;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
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
    const limit = authState.user.subscription.assetLimit;
    return limit === 'unlimited' || currentAssetCount < (limit as number);
  };

  const canAddTeamMember = (): boolean => {
    if (!authState.user || authState.user.userType === 'service_provider') return false;
    const limit = authState.user.subscription.seatLimit;
    const used = authState.user.organization?.subscription.usedSeats || 1;
    return limit === 'unlimited' || used < (limit as number);
  };

  const getAssetLimit = (): number | 'unlimited' => {
    if (!authState.user || authState.user.userType === 'service_provider') return 0;
    return authState.user.subscription.assetLimit || 5;
  };

  const getSeatLimit = (): number | 'unlimited' => {
    if (!authState.user || authState.user.userType === 'service_provider') return 0;
    return authState.user.subscription.seatLimit || 1;
  };

  const upgradePlan = async (plan: SubscriptionPlan | ServiceProviderPlan): Promise<boolean> => {
    if (!authState.user) return false;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    let updatedUser = { ...authState.user };

    if (authState.user.userType === 'service_provider') {
      // Handle service provider plan upgrades
      const serviceProviderFeatures = {
        verified: { isVerified: true, canDirectMessage: false, isPromoted: false },
        premium: { isVerified: true, canDirectMessage: true, isPromoted: false },
        promoted: { isVerified: true, canDirectMessage: true, isPromoted: true },
      };

      const features = serviceProviderFeatures[plan as ServiceProviderPlan] || serviceProviderFeatures.verified;

      updatedUser = {
        ...authState.user,
        subscription: {
          ...authState.user.subscription,
          plan,
        },
        serviceProviderProfile: authState.user.serviceProviderProfile ? {
          ...authState.user.serviceProviderProfile,
          subscription: {
            ...authState.user.serviceProviderProfile.subscription,
            plan: plan as ServiceProviderPlan,
          },
          ...features,
        } : undefined
      };
    } else {
      // Handle customer plan upgrades
      let assetLimit: number | 'unlimited';
      let seatLimit: number | 'unlimited';

      switch (plan) {
        case 'pro':
          assetLimit = 'unlimited';
          seatLimit = 1;
          break;
        case 'ai-powered':
          assetLimit = 'unlimited';
          seatLimit = 1;
          break;
        default:
          assetLimit = 5;
          seatLimit = 1;
      }

      updatedUser = {
        ...authState.user,
        subscription: {
          ...authState.user.subscription,
          plan,
          assetLimit,
          seatLimit,
        },
        organization: authState.user.organization ? {
          ...authState.user.organization,
          subscription: {
            ...authState.user.organization.subscription,
            plan: plan as SubscriptionPlan,
            assetLimit,
            seatLimit,
          }
        } : undefined
      };
    }

    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));

    localStorage.setItem('maintenanceManager_user', JSON.stringify(updatedUser));
    return true;
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