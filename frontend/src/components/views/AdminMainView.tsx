// frontend/src/components/views/AdminMainView.tsx
import React, { useState } from 'react';
import { AdminSidebar } from '../AdminSidebar';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersView } from './AdminUsersView';
import { AdminPaymentsView } from './AdminPaymentsView';
import { AdminMatchingView } from './AdminMatchingView';
import { AdminAnalyticsView } from './AdminAnalyticsView';
import { AccountView } from './AccountView';
import AdminApiTestView from './AdminApiTestView';

type AdminView = 'dashboard' | 'users' | 'providers' | 'payments' | 'matching' | 'analytics' | 'account' | 'api-test';

export function AdminMainView() {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'users':
        return <AdminUsersView />;
      case 'providers':
        return <AdminUsersView />; // Can filter for providers or create separate component
      case 'payments':
        return <AdminPaymentsView />;
      case 'matching':
        return <AdminMatchingView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'account':
        return <AccountView />;
      case 'api-test':
        return <AdminApiTestView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar - same approach as your AppSidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <AdminSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Main Content Area - same approach as your main app */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-900">Casey Admin Panel</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
