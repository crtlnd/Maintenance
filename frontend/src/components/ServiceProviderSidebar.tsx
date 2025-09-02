import React from 'react';
import { LayoutDashboard, ClipboardList, User } from 'lucide-react';
import caseyUptimeLogo from 'figma:asset/b0281f1af0d4ecb0182aeab92b8439ecbadd5431.png';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ServiceProviderView } from '../types';
import { useAuth } from '../utils/auth';

interface ServiceProviderSidebarProps {
  currentView: ServiceProviderView;
  onViewChange: (view: ServiceProviderView) => void;
}

export function ServiceProviderSidebar({ currentView, onViewChange }: ServiceProviderSidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, key: 'dashboard' as ServiceProviderView },
    { title: "Service Requests", icon: ClipboardList, key: 'requests' as ServiceProviderView },
    { title: "Profile", icon: User, key: 'profile' as ServiceProviderView }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <img
            src={caseyUptimeLogo}
            alt="Casey Uptime"
            className="h-12 w-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={currentView === item.key}
                onClick={() => onViewChange(item.key)}
                className="w-full justify-start"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={currentView === 'account'}
            onClick={() => onViewChange('account')}
            className="w-full justify-start"
          >
            <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user?.firstName[0]}{user?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
