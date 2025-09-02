import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useAuth } from '../utils/auth';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  avatar?: string;
  subscription?: { plan: string };
}

interface SettingsProps {
  user: User | null;
}

function Settings({ user }: SettingsProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-lg">
                {user?.firstName?.[0] ?? ''}{user?.lastName?.[0] ?? ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user?.firstName ?? 'User'} {user?.lastName ?? ''}</h3>
              <p className="text-sm text-muted-foreground">{user?.email ?? 'N/A'}</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role ?? 'unknown'} • {user?.subscription?.plan ?? 'Basic'} Plan</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
