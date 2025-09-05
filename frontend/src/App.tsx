// App.tsx
import React, { useState, useEffect, Component } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import AuthPage from './components/auth/AuthPage';
import LandingPage from './components/LandingPage';
import MainLayout from './components/layouts/MainLayout';
import MainRoutes from './components/routes/MainRoutes';
import { AdminMainView } from './components/views/AdminMainView';
import { maintenanceApi } from '../services/api';
import { NotificationIntegration } from './utils/notificationIntegration';
import { createCompleteDemo } from './utils/demoData';
import {
  initialFMEAData,
  initialRCAData,
  initialServiceProviders
} from './data/initialData';

// Import the new InvitationHandler component
import InvitationHandler from './components/InvitationHandler';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-6"><h2>Something went wrong.</h2><p>Please refresh the page or try again later.</p></div>;
    }
    return this.props.children;
  }
}

// Main authenticated app content
function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [fmeaData, setFmeaData] = useState(initialFMEAData);
  const [rcaData, setRcaData] = useState(initialRCAData);
  const [serviceProviders, setServiceProviders] = useState(initialServiceProviders);

  // Load assets from API
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

  // Load maintenance tasks from API
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
    }, 60 * 60 * 1000);

    return () => clearInterval(overdueCheckInterval);
  }, [isAuthenticated, user, maintenanceData, assets]);

  // Event handlers
  const handleGetStarted = () => navigate('/auth?mode=signup');
  const handleLogin = () => navigate('/auth?mode=login');

  const handleAddAsset = (asset) => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newAsset = { ...asset, id: newId };
    setAssets(prev => [...prev, newAsset]);
    return newId;
  };

  const handleCreateDemoData = async () => {
    await createCompleteDemo(
      handleAddAsset,
      setMaintenanceData,
      setFmeaData,
      setRcaData
    );
  };

  const handleAddMaintenanceTask = async (task) => {
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

  const handleCompleteTask = async (taskId, completionData) => {
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

  // Loading states
  if (loading || assetsLoading || maintenanceLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Render based on authentication state
  return (
    <ErrorBoundary>
      <TooltipProvider>
        {isAuthenticated ? (
          // Admin routes handling
          location.pathname.startsWith('/admin') ? (
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
            // Main app with sidebar layout
            <MainLayout user={user} assets={assets} setAssets={setAssets}>
              <MainRoutes
                user={user}
                assets={assets}
                setAssets={setAssets}
                maintenanceData={maintenanceData}
                setMaintenanceData={setMaintenanceData}
                fmeaData={fmeaData}
                setFmeaData={setFmeaData}
                rcaData={rcaData}
                setRcaData={setRcaData}
                serviceProviders={serviceProviders}
                setServiceProviders={setServiceProviders}
                handleAddAsset={handleAddAsset}
                handleAddMaintenanceTask={handleAddMaintenanceTask}
                handleCompleteTask={handleCompleteTask}
                handleCreateDemoData={handleCreateDemoData}
              />
            </MainLayout>
          )
        ) : (
          // Unauthenticated routes - UPDATED SECTION
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Routes>
              {/* Add the invitation handler route */}
              <Route path="/join-organization" element={<InvitationHandler />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />} />
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
