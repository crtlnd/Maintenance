import React, { useState, useEffect, Suspense, Component } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppSidebar from './components/AppSidebar';
import {
  initialFMEAData,
  initialRCAData,
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
import { AccountView } from './components/views/AccountView';
import { AdminMainView } from './components/views/AdminMainView';
import { maintenanceApi } from '../services/api';
import { NotificationIntegration } from './utils/notificationIntegration';
import { createCompleteDemo } from './utils/demoData';

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

// Success page handler with auto-redirect
function SuccessPageHandler(props: any) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Payment successful! Redirecting in 3 seconds...');
    // Show success message and redirect after 3 seconds
    const timer = setTimeout(() => {
      // Force a full page reload to refresh user context
      window.location.href = '/';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-green-700">
            Your subscription has been upgraded successfully.
            You'll be redirected to your dashboard in a moment...
          </p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
      <AssetsView {...props} />
    </div>
  );
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
      defaultTab="overview"
      onBack={() => navigate('/')}
      onAddRCA={(rca) => {
        const newRCA = { ...rca, id: Date.now() };
        setRcaData((prev: any[]) => [...prev, newRCA]);
      }}
      onAddMaintenanceTask={async (task) => {
        try {
          const newTask = await maintenanceApi.createTask({
            ...task,
            assetId: asset.id
          });
          setMaintenanceData((prev: any[]) => [...prev, newTask]);
          await NotificationIntegration.notifyTaskAssignment(newTask, asset);
        } catch (error) {
          console.error('Error creating maintenance task:', error);
        }
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

// Component to handle asset detail with maintenance tab navigation
function AssetDetailMaintenanceWrapper({
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
      defaultTab="maintenance"
      onBack={() => navigate('/')}
      onAddRCA={(rca) => {
        const newRCA = { ...rca, id: Date.now() };
        setRcaData((prev: any[]) => [...prev, newRCA]);
      }}
      onAddMaintenanceTask={async (task) => {
        try {
          const newTask = await maintenanceApi.createTask({
            ...task,
            assetId: asset.id
          });
          setMaintenanceData((prev: any[]) => [...prev, newTask]);
          await NotificationIntegration.notifyTaskAssignment(newTask, asset);
        } catch (error) {
          console.error('Error creating maintenance task:', error);
        }
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

  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [fmeaData, setFmeaData] = useState(initialFMEAData);
  const [rcaData, setRcaData] = useState(initialRCAData);
  const [serviceProviders, setServiceProviders] = useState(initialServiceProviders);

  // Load real assets from API when user logs in
  useEffect(() => {
    const loadAssets = async () => {
      if (!isAuthenticated || !user) {
        setAssets([]);
        return;
      }

      setAssetsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/assets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const realAssets = await response.json();
          setAssets(realAssets);
        } else {
          console.error('Failed to load assets:', response.status);
          setAssets([]);
        }
      } catch (error) {
        console.error('Error loading assets:', error);
        setAssets([]);
      } finally {
        setAssetsLoading(false);
      }
    };

    loadAssets();
  }, [isAuthenticated, user]);

  // Load real maintenance tasks from API
  useEffect(() => {
    const loadMaintenanceTasks = async () => {
      if (!isAuthenticated || !user) {
        setMaintenanceData([]);
        return;
      }

      setMaintenanceLoading(true);
      try {
        const tasks = await maintenanceApi.getTasks();
        setMaintenanceData(tasks);
      } catch (error) {
        console.error('Error loading maintenance tasks:', error);
        setMaintenanceData([]);
      } finally {
        setMaintenanceLoading(false);
      }
    };

    loadMaintenanceTasks();
  }, [isAuthenticated, user]);

  // Check for overdue tasks periodically
  useEffect(() => {
    if (!isAuthenticated || !user || !maintenanceData.length || !assets.length) return;

    NotificationIntegration.checkAndNotifyOverdueTasks(maintenanceData, assets);

    const overdueCheckInterval = setInterval(() => {
      NotificationIntegration.checkAndNotifyOverdueTasks(maintenanceData, assets);
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(overdueCheckInterval);
  }, [isAuthenticated, user, maintenanceData, assets]);

  const handleGetStarted = () => navigate('/auth?mode=signup');
  const handleLogin = () => navigate('/auth?mode=login');

  // Handle asset creation
  const handleAddAsset = (asset: any): number => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newAsset = { ...asset, id: newId };

    setAssets(prev => [...prev, newAsset]);
    return newId;
  };

  // Handle demo data creation
  const handleCreateDemoData = async () => {
    await createCompleteDemo(
      handleAddAsset,
      setMaintenanceData,
      setFmeaData,
      setRcaData
    );
  };

  // Handle maintenance task creation
  const handleAddMaintenanceTask = async (task: any) => {
    try {
      if (task.isDemo) {
        const taskWithId = { ...task, id: Date.now() + Math.random() };
        setMaintenanceData(prev => [...prev, taskWithId]);
        return taskWithId.id;
      }

      const newTask = await maintenanceApi.createTask(task);
      setMaintenanceData(prev => [...prev, newTask]);

      const asset = assets.find(a => a.id === task.assetId);
      if (asset) {
        await NotificationIntegration.notifyTaskAssignment(newTask, asset);
      }

      return newTask.id;
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      throw error;
    }
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: number, completionData: any) => {
    try {
      const updatedTask = await maintenanceApi.completeTask(taskId, completionData);
      setMaintenanceData(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...updatedTask, status: 'completed' } : task
        )
      );

      const task = maintenanceData.find(t => t.id === taskId);
      const asset = assets.find(a => a.id === task?.assetId);
      if (task && asset) {
        await NotificationIntegration.notifyTaskCompletion(
          { ...task, ...updatedTask, status: 'completed' },
          asset,
          user?.firstName + ' ' + user?.lastName || 'Unknown User'
        );
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setMaintenanceData(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: 'completed', ...completionData }
            : task
        )
      );
    }
  };

  if (loading || assetsLoading || maintenanceLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        {isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            {location.pathname.startsWith('/admin') ? (
              <Routes>
                <Route
                  path="/admin/*"
                  element={
                    user?.userType === 'admin' || user?.role === 'admin' ? (
                      <AdminMainView />
                    ) : (
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                          <p className="text-gray-600 mb-4">Admin access required.</p>
                          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
                        </div>
                      </div>
                    )
                  }
                />
              </Routes>
            ) : (
              <>
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
                      <h1 className="text-xl font-semibold text-gray-900">Maintenance Manager</h1>
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
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <AssetsView
                            assets={assets}
                            onAddAsset={handleAddAsset}
                            onSelectAsset={(assetId) => navigate(`/assets/${assetId}`)}
                            onAddFMEA={(fmea) => {
                              const fmeaWithIds = fmea.map(entry => ({
                                ...entry,
                                id: Date.now() + Math.random()
                              }));
                              setFmeaData(prev => [...prev, ...fmeaWithIds]);
                            }}
                            onAddMaintenanceTask={(tasks) => {
                              tasks.forEach(task => handleAddMaintenanceTask(task));
                            }}
                            onAddSingleMaintenanceTask={handleAddMaintenanceTask}
                            onEditAsset={(asset) => {
                              setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
                            }}
                            onCreateDemoData={handleCreateDemoData}
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
                        path="/assets/:assetId/maintenance"
                        element={
                          <AssetDetailMaintenanceWrapper
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
                            onSelectAsset={(assetId) => navigate(`/assets/${assetId}/maintenance`)}
                            onCompleteTask={handleCompleteTask}
                            onAddMaintenanceTask={handleAddMaintenanceTask}
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
                      <Route path="/settings" element={<AccountView />} />
                      <Route
                        path="/success"
                        element={
                          <SuccessPageHandler
                            assets={assets}
                            onAddAsset={handleAddAsset}
                            onSelectAsset={(assetId) => navigate(`/assets/${assetId}`)}
                            onAddFMEA={(fmea) => {
                              const fmeaWithIds = fmea.map(entry => ({
                                ...entry,
                                id: Date.now() + Math.random()
                              }));
                              setFmeaData(prev => [...prev, ...fmeaWithIds]);
                            }}
                            onAddMaintenanceTask={(tasks) => {
                              tasks.forEach(task => handleAddMaintenanceTask(task));
                            }}
                            onAddSingleMaintenanceTask={handleAddMaintenanceTask}
                            onEditAsset={(asset) => {
                              setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
                            }}
                            onCreateDemoData={handleCreateDemoData}
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
              </>
            )}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
