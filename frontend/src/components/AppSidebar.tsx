import React from 'react';
import { Shapes, ClipboardList, Bot, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Asset } from '../types';

const caseyUptimeLogo = null; // Temporarily remove logo

interface User {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
}

interface AppSidebarProps {
  user: User | null;
  plan: string;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const iconMap = {
  Shapes,
  ClipboardList,
  Bot,
  Users,
};

function AppSidebar({ user, plan, assets, setAssets }: AppSidebarProps) {
  const menuItems = [
    { title: 'Asset Dashboard', icon: 'Shapes', path: '/' },
    { title: 'Task List', icon: 'ClipboardList', path: '/maintenance' },
    { title: 'AI Assistant', icon: 'Bot', path: '/fmea' },
    { title: 'Service Providers', icon: 'Users', path: '/service-providers' },
  ];

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          {caseyUptimeLogo ? (
            <img src={caseyUptimeLogo} alt="Casey Uptime" className="h-12 w-auto" />
          ) : (
            <div className="h-12 w-auto flex items-center justify-center text-sm font-semibold text-gray-900">
              Casey Uptime
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.title}</span>
                {item.path === '/fmea' && plan !== 'ai-powered' && (
                  <div className="ml-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Pro
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
              isActive
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0] ?? ''}{user?.lastName?.[0] ?? ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-sm font-medium truncate">
              {user?.firstName ?? 'User'} {user?.lastName ?? ''}
            </span>
            <span className="text-xs text-gray-500 truncate">{user?.role ?? 'Unknown'}</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default AppSidebar;
