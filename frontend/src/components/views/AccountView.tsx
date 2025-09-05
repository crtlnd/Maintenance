import React, { useState } from 'react';
import { User, Bell, CreditCard, Shield, Users, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ProfileSettings } from '../account/ProfileSettings';
import { NotificationSettings } from '../account/NotificationSettings';
import { CustomerPricingSection } from '../account/CustomerPricingSection'; // FIXED: Changed from PricingSection
import { TeamSettings } from '../account/TeamSettings';
import { useAuth } from '../../contexts/AuthContext'; // FIXED: Changed from '../../contexts/AuthContext'

type AccountViewType = 'profile' | 'team' | 'notifications' | 'billing' | 'security';

export function AccountView() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountViewType>('profile'); // FIXED: Default to billing tab for upgrade flow

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h2>Please log in to view your account settings</h2>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const getPlanBadge = (plan: string) => {
    const badgeStyles = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800', // FIXED: Added professional
      annual: 'bg-gold-100 text-gold-800', // FIXED: Added annual
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800'
    };

    return (
      <Badge
        variant="secondary"
        className={badgeStyles[plan?.toLowerCase() as keyof typeof badgeStyles] || badgeStyles.basic}
      >
        {plan?.charAt(0).toUpperCase() + plan?.slice(1) || 'Basic'} Plan
      </Badge>
    );
  };

  // FIXED: Handle different user object structures
  const userPlan = user?.subscription?.plan || user?.subscriptionTier || 'Basic';
  const userFirstName = user?.firstName || user?.first_name || 'User';
  const userLastName = user?.lastName || user?.last_name || '';
  const userEmail = user?.email || '';
  const userCompany = user?.company || user?.organization || 'Your Company';
  const userRole = user?.role || user?.userType || 'User';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-lg">
              {userFirstName[0]}{userLastName[0] || userFirstName[1] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2>{userFirstName} {userLastName}</h2>
              {getPlanBadge(userPlan)}
            </div>
            <p className="text-muted-foreground">{userRole} at {userCompany}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Account Settings */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountViewType)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <CustomerPricingSection />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3>Security Settings</h3>
              <p className="text-muted-foreground">
                Manage your account security and privacy settings.
              </p>
            </div>

            {/* Password Section */}
            <div className="grid gap-6">
              <div className="p-6 border rounded-lg space-y-4">
                <div>
                  <h4>Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never (Demo account)
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>

              <div className="p-6 border rounded-lg space-y-4">
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Coming Soon
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    2FA will be available in a future update
                  </span>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>

              <div className="p-6 border rounded-lg space-y-4">
                <div>
                  <h4>Account Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download your data or delete your account.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    Export Data
                  </Button>
                  <Button variant="destructive" disabled>
                    Delete Account
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data management features coming soon
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
