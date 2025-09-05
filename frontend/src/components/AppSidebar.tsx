import React from 'react';
import { Shapes, ClipboardList, Bot, Users, Brain, MessageSquare, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Asset } from '../types';

interface User {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  subscriptionTier?: string;
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
  Brain,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Settings,
};

function AppSidebar({ user, plan, assets, setAssets }: AppSidebarProps) {
  const isAIPowered = plan === 'ai-powered' || user?.subscriptionTier === 'ai-powered';

  const mainMenuItems = [
    { title: 'Asset Dashboard', icon: 'Shapes', path: '/' },
    { title: 'Task List', icon: 'ClipboardList', path: '/maintenance' },
    { title: 'Service Providers', icon: 'Users', path: '/service-providers' },
  ];

  const aiMenuItems = [
    { title: 'AI Insights', icon: 'Brain', path: '/ai-insights' },
    { title: 'AI Chat', icon: 'MessageSquare', path: '/ai-chat' },
    { title: 'Risk Analysis', icon: 'AlertTriangle', path: '/ai-risk-analysis' },
    { title: 'Predictive Analysis', icon: 'TrendingUp', path: '/ai-predictive' },
  ];

  const renderMenuItem = (item: any) => {
    const IconComponent = typeof item.icon === 'string'
      ? iconMap[item.icon as keyof typeof iconMap]
      : item.icon;

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
      </NavLink>
    );
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Casey Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img
            src="/src/assets/casey-logo.jpg"
            alt="Casey"
            className="h-10 w-auto"
          />
        </div>
        {/* AI Plan Indicator */}
        {isAIPowered && (
          <div className="mt-3 flex items-center justify-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI-Powered
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-2">
        <nav className="space-y-4">
          {/* Main Navigation */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Main
            </div>
            <div className="space-y-1">
              {mainMenuItems.map((item) => renderMenuItem(item))}
            </div>
          </div>

          {/* AI Features Navigation */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Brain className="h-3 w-3" />
              AI Features
            </div>
            <div className="space-y-1">
              {aiMenuItems.map((item) => renderMenuItem(item))}
            </div>
          </div>

          {/* Legacy AI Assistant (for backwards compatibility) */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Legacy
            </div>
            <div className="space-y-1">
              <NavLink
                to="/fmea"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Bot className="h-5 w-5" />
                <span>AI Assistant (Legacy)</span>
              </NavLink>
            </div>
          </div>
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
            <span className="text-xs text-gray-500 truncate">
              {isAIPowered ? 'AI-Powered Plan' : (user?.role ?? 'Basic Plan')}
            </span>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default AppSidebar;
