import React, { useState, useEffect, Suspense, Component } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppSidebar from './components/AppSidebar';
import {
  initialAssets,
  initialFMEAData,
  initialRCAData,
  initialMaintenanceData,
  initialServiceProviders
} from './data/initialData';
import AuthPage from './components/auth/AuthPage';
import LandingPage from './components/LandingPage';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import AssetsView from './components/views/AssetsView';
import { AssetDetailView } from './components/views/AssetDetailView';
import { TaskListView } from './components/views/TaskListView';
import AIAssistantView from './components/views/AIAssistantView';
import ProvidersView from './components/views/ProvidersView';
import Settings from './components/Settings';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-6"><h2>Something went wrong.</h2><p>Please refresh the page or try again later.</p></div>;
    }
    return this.props.children;
  }
}

// Component to handle individual asset detail
function AssetDetailWrapper({
  assets,
  fmeaData,
  rcaData,
  maintenanceData,
  setMaintenanceData,
  setAssets,
  setFmeaData,
  setRcaData
}: {
  assets: any[];
  fmeaData: any[];
  rcaData: any[];
  maintenanceData: any[];
  setMaintenanceData: any;
  setAssets: any;
  setFmeaData: any;
  setRcaData: any;
}) {
  const { assetId } = useParams();
  const navigate = useNavigate();

  const asset = assets.find(a => a.id === parseInt(assetId || '0'));

  if (!asset) {
    return (
      <div className="p-6">
        <h2>Asset not found</h2>
        <Button onClick={() => navigate('/')}>Back to Assets</Button>
      </div>
    );
  }

  return (
    <AssetDetailView
      asset={asset}
      fmeaData={fmeaData}
      rcaData={rcaData}
      maintenanceData={maintenanceData}
      onBack={() => navigate('/')}
      onAddRCA={(rca) => {
        const newRCA = { ...rca, id: Date.now() };
        setRcaData((prev: any[]) => [...prev, newRCA]);
      }}
      onAddMaintenanceTask={(task) => {
        const newTask = { ...task, id: Date.now() };
        setMaintenanceData((prev: any[]) => [...prev, newTask]);
      }}
      onEditAsset={(updatedAsset) => {
        setAssets((prev: any[]) => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      }}
      onAddFMEA={(fmeaEntries) => {
        const newEntries = fmeaEntries.map(entry => ({
          ...entry,
          id: Date.now() + Math.random(),
        }));
        setFmeaData((prev: any[]) => [...prev, ...newEntries]);
      }}
    />
  );
}

// Separate component that uses the auth hook
function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [assets, setAssets] = useState(initialAssets);
  const [fmeaData, setFmeaData] = useState(initialFMEAData);
  const [rcaData, setRcaData] = useState(initialRCAData);
  const [maintenanceData, setMaintenanceData] = useState(initialMaintenanceData);
  const [serviceProviders, setServiceProviders] = useState(initialServiceProviders);

  // Add debugging
  console.log('Auth Debug:', { isAuthenticated, user, loading });

  // TEMPORARY: Override plan to Professional for testing
  const testUser = user ? {
    ...user,
    subscription: {
      ...user.subscription,
      plan: 'Professional'
    },
    subscriptionTier: 'Professional'
  } : user;

  useEffect(() => {
    if (user && user.assets && user.assets.length > 0) {
      setAssets(user.assets);
    } else if (user) {
      // User exists but has no saved assets, use mock data
      console.log('Loading mock assets for user with no saved assets');
      setAssets(initialAssets);
    }
  }, [user]);

  const handleGetStarted = () => navigate('/auth?mode=signup');
  const handleLogin = () => navigate('/auth?mode=login');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        {isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            {/* Fixed Sidebar */}
            <div className="w-64 fixed inset-y-0 left-0 z-50">
              <AppSidebar
                user={testUser}
                plan={testUser?.subscription?.plan || 'Professional'}
                assets={assets}
                setAssets={setAssets}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
              <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-900">Maintenance Manager</h1>
              </header>

              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <AssetsView
                        assets={assets}
                        onAddAsset={(asset) => {
                          const newAsset = { ...asset, id: Date.now() };
                          setAssets(prev => [...prev, newAsset]);
                          return newAsset.id;
                        }}
                        onSelectAsset={(assetId) => {
                          navigate(`/assets/${assetId}`);
                        }}
                        onAddFMEA={(fmea) => {
                          console.log('Add FMEA:', fmea);
                        }}
                        onAddMaintenanceTask={(tasks) => {
                          const newTasks = tasks.map(task => ({
                            ...task,
                            id: Date.now() + Math.random(),
                          }));
                          setMaintenanceData(prev => [...prev, ...newTasks]);
                        }}
                        onEditAsset={(asset) => {
                          setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
                        }}
                      />
                    }
                  />
                  <Route
                    path="/assets/:assetId"
                    element={
                      <AssetDetailWrapper
                        assets={assets}
                        fmeaData={fmeaData}
                        rcaData={rcaData}
                        maintenanceData={maintenanceData}
                        setMaintenanceData={setMaintenanceData}
                        setAssets={setAssets}
                        setFmeaData={setFmeaData}
                        setRcaData={setRcaData}
                      />
                    }
                  />
                  <Route
                    path="/maintenance"
                    element={
                      <TaskListView
                        assets={assets}
                        maintenanceData={maintenanceData}
                        onSelectAsset={(assetId) => {
                          navigate(`/assets/${assetId}`);
                        }}
                        onCompleteTask={(taskId, completionData) => {
                          setMaintenanceData(prev =>
                            prev.map(task =>
                              task.id === taskId
                                ? { ...task, status: 'completed', ...completionData }
                                : task
                            )
                          );
                        }}
                        onAddMaintenanceTask={(task) => {
                          const newTask = { ...task, id: Date.now() };
                          setMaintenanceData(prev => [...prev, newTask]);
                        }}
                      />
                    }
                  />
                  <Route
                    path="/fmea"
                    element={<AIAssistantView assets={assets} maintenanceData={maintenanceData} />}
                  />
                  <Route
                    path="/service-providers"
                    element={<ProvidersView serviceProviders={serviceProviders} setServiceProviders={setServiceProviders} />}
                  />
                  <Route path="/settings" element={<Settings user={testUser} />} />
                  <Route
                    path="/success"
                    element={
                      <AssetsView
                        assets={assets}
                        onAddAsset={(asset) => {
                          const newAsset = { ...asset, id: Date.now() };
                          setAssets(prev => [...prev, newAsset]);
                          return newAsset.id;
                        }}
                        onSelectAsset={(assetId) => navigate(`/assets/${assetId}`)}
                        onAddFMEA={(fmea) => console.log('Add FMEA:', fmea)}
                        onAddMaintenanceTask={(tasks) => {
                          const newTasks = tasks.map(task => ({
                            ...task,
                            id: Date.now() + Math.random(),
                          }));
                          setMaintenanceData(prev => [...prev, ...newTasks]);
                        }}
                        onEditAsset={(asset) => {
                          setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
                        }}
                      />
                    }
                  />
                  <Route
                    path="/cancel"
                    element={<div className="p-6"><h2>Subscription Canceled</h2><p>You have canceled the subscription process. Please try again if needed.</p></div>}
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Routes>
              <Route path="*" element={<LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </div>
        )}
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

// Main App component that wraps everything with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
