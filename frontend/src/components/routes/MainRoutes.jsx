// frontend/src/components/routes/MainRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AssetsView from '../views/AssetsView';
import { TaskListView } from '../views/TaskListView';
import ProvidersView from '../views/ProvidersView';
import { AccountView } from '../views/AccountView';
import { AssetDetailWrapper, AssetDetailMaintenanceWrapper } from '../wrappers/AssetDetailWrappers';
import { maintenanceApi } from '../../../services/api';
import { NotificationIntegration } from '../../utils/notificationIntegration';

// AI Components - New modular approach
import AIChatView from '../views/AIChatView';
import AIInsightsView from '../views/AIInsightsView';
import AIRiskAnalysisView from '../views/AIRiskAnalysisView';
import AIPredictiveView from '../views/AIPredictiveView';

// Notifications Component - NEW
import { NotificationView } from '../views/NotificationView';

// AI Service
import aiService from '../../../services/aiService';

// Success page handler with auto-redirect
function SuccessPageHandler(props) {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('Payment successful! Redirecting in 3 seconds...');
    const timer = setTimeout(() => {
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
          </p>
        </div>
        <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}

// AI Protection Component - checks if user has AI credits
function AIProtectedRoute({ children, user }) {
  // TEMPORARILY DISABLE ALL PROTECTION FOR DEVELOPMENT
  return children;

  // TODO: Enable this when credits system is implemented:
  /*
  const hasCredits = user?.aiCredits > 0;

  if (!hasCredits) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-orange-800 mb-2">No AI Credits Remaining</h2>
            <p className="text-orange-700 mb-4">
              You've used all your AI credits. Top up your account to continue using AI features.
            </p>
            <button
              onClick={() => window.location.href = '/settings'}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Top Up Credits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
  */
}

export default function MainRoutes({
  user,
  assets = [],
  setAssets,
  maintenanceData = [],
  setMaintenanceData,
  fmeaData = [],
  setFmeaData,
  rcaData = [],
  setRcaData,
  serviceProviders = [],
  setServiceProviders,
  handleAddAsset,
  handleAddMaintenanceTask,
  handleCompleteTask,
  handleCreateDemoData
}) {
  const navigate = useNavigate();

  // Handle asset creation success
  const handleAssetCreated = () => {
    window.location.reload();
  };

  // Handle maintenance task creation
  const handleMaintenanceTaskCreated = async (assetId, taskData) => {
    try {
      await maintenanceApi.createTask(assetId, taskData);

      // Show success notification
      NotificationIntegration.showSuccess(
        'Maintenance Task Created',
        `Task "${taskData.title}" has been scheduled`
      );

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      NotificationIntegration.showError(
        'Error',
        'Failed to create maintenance task'
      );
    }
  };

  // Handle asset editing
  const handleEditAsset = (updatedAsset) => {
    const updatedAssets = assets.map(asset =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    );
    setAssets(updatedAssets);
  };

  return (
    <Routes>
      {/* Dashboard redirect */}
      <Route path="/" element={<Navigate to="/assets" replace />} />

      {/* Main application routes */}
      <Route
        path="/assets"
        element={
          <AssetsView
            onAssetCreated={handleAssetCreated}
            assets={assets}
            onSelectAsset={(assetId) => navigate(`/assets/${assetId}`)}
            onAddAsset={handleAddAsset}
            onAddFMEA={(fmeaEntries) => {
              setFmeaData(prev => [...prev, ...fmeaEntries]);
            }}
            onAddMaintenanceTask={(tasks) => {
              setMaintenanceData(prev => [...prev, ...tasks]);
            }}
            onAddSingleMaintenanceTask={handleAddMaintenanceTask}
            onEditAsset={handleEditAsset}
            onCreateDemoData={handleCreateDemoData}
          />
        }
      />

      <Route
        path="/assets/:id"
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
            onMaintenanceTaskCreated={handleMaintenanceTaskCreated}
          />
        }
      />

      <Route
        path="/assets/:id/maintenance/:maintenanceId"
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

      <Route path="/tasks" element={<TaskListView
        assets={assets}
        maintenanceData={maintenanceData}
        onSelectAsset={(assetId) => navigate(`/assets/${assetId}`)}
        onCompleteTask={handleCompleteTask}
        onAddMaintenanceTask={handleAddMaintenanceTask}
      />} />

      <Route path="/service-providers" element={<ProvidersView />} />

      {/* Notifications Route - NEW */}
      <Route path="/notifications" element={<NotificationView />} />

      {/* AI Feature Routes - New Modular Approach */}
      <Route
        path="/ai-chat"
        element={
          <AIProtectedRoute user={user}>
            <AIChatView />
          </AIProtectedRoute>
        }
      />

      <Route
        path="/ai-insights"
        element={
          <AIProtectedRoute user={user}>
            <AIInsightsView assets={assets} />
          </AIProtectedRoute>
        }
      />

      <Route
        path="/ai-risk-analysis"
        element={
          <AIProtectedRoute user={user}>
            <AIRiskAnalysisView assets={assets} />
          </AIProtectedRoute>
        }
      />

      <Route
        path="/ai-predictive"
        element={
          <AIProtectedRoute user={user}>
            <AIPredictiveView assets={assets} />
          </AIProtectedRoute>
        }
      />

      {/* Account and Settings */}
      <Route path="/settings" element={<AccountView />} />

      {/* Payment success page */}
      <Route path="/success" element={<SuccessPageHandler />} />

      {/* Catch all - redirect to assets */}
      <Route path="*" element={<Navigate to="/assets" replace />} />
    </Routes>
  );
}
