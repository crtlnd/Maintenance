import React from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  User,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";

type AdminView = 'dashboard' | 'users' | 'providers' | 'payments' | 'matching' | 'analytics' | 'account' | 'api-test';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const iconMap = {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  User,
  Zap,
};

export function AdminSidebar({
  currentView,
  onViewChange,
}: AdminSidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: "LayoutDashboard",
      key: "dashboard" as AdminView,
    },
    { title: "Users", icon: "Users", key: "users" as AdminView },
    {
      title: "Service Providers",
      icon: "Users",
      key: "providers" as AdminView,
    },
    {
      title: "Payments",
      icon: "DollarSign",
      key: "payments" as AdminView,
    },
    {
      title: "Matching",
      icon: "Settings",
      key: "matching" as AdminView,
    },
    {
      title: "Analytics",
      icon: "BarChart3",
      key: "analytics" as AdminView,
    },
    {
      title: "API Test",
      icon: "Zap",
      key: "api-test" as AdminView,
    },
  ];

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="h-12 w-auto flex items-center justify-center text-lg font-semibold text-blue-600">
            Casey Uptime Admin
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <button
                key={item.title}
                onClick={() => onViewChange(item.key)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
                  currentView === item.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => onViewChange("account")}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
            currentView === "account"
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0] ?? ''}{user?.lastName?.[0] ?? ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-sm font-medium truncate">
              {user?.firstName ?? 'Admin'} {user?.lastName ?? ''}
            </span>
            <span className="text-xs text-gray-500 truncate">{user?.role ?? 'Administrator'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
