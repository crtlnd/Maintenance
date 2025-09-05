// frontend/src/components/layouts/MainLayout.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppSidebar from '../AppSidebar';

function MainLayout({ user, assets, setAssets, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <AppSidebar
          user={user}
          plan={user?.subscription?.plan || user?.subscriptionTier || 'Basic'}
          assets={assets}
          setAssets={setAssets}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.organization || user?.company || 'Dashboard'}
            </h1>
            {(user?.userType === 'admin' || user?.role === 'admin') && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="ml-2"
              >
                Admin Panel
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
