// frontend/src/components/routes/MainRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AssetsView from '../views/AssetsView';
import BulkAssetImportView from '../views/BulkAssetImportView';
import { TaskListView } from '../views/TaskListView';
import AIAssistantView from '../views/AIAssistantView';
import ProvidersView from '../views/ProvidersView';
import { AccountView } from '../views/AccountView';
import { AssetDetailWrapper, AssetDetailMaintenanceWrapper } from '../wrappers/AssetDetailWrappers';
import { maintenanceApi } from '../../../services/api';
import { NotificationIntegration } from '../../utils/notificationIntegration';

// AI Service
import aiService from '../../../services/aiService';

// AI Components - All real components now available
import AIChatView from '../views/AIChatView';
import AIInsightsView from '../views/AIInsightsView';
import AIRiskAnalysisView from '../views/AIRiskAnalysisView';
import AIPredictiveView from '../views/AIPredictiveView';

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

// Credit-Based AI Route Protection Component - WITH TEST CREDITS for development
function AIProtectedRoute({ children, user }) {
  // FOR TESTING: Give users 100 test credits if they don't have any
  const userCredits = user?.aiCredits || user?.credits || 100; // Default to 100 for testing
  const hasCredits = userCredits > 0;

  if (!hasCredits) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">AI Credits Depleted</h3>
          <p className="text-amber-700 mb-4">
            You've used all your AI credits for this month. Upgrade your plan or purchase additional credits to continue using AI features.
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Monthly AI Credits:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Basic Plan ($20/month):</span>
                <span className="font-semibold">250 AI credits</span>
              </div>
              <div className="flex justify-between">
                <span>Professional Plan ($50/month):</span>
                <span className="font-semibold">1,000 AI credits</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                That's enough for hundreds of AI interactions per month! Most users use 50-150 credits monthly.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/settings'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan or Buy Credits
            </button>
            <p className="text-xs text-gray-500 text-center">
              Basic top-up: $20 for 250 credits • Professional top-up: $40 for 500 credits
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function MainRoutes({
  user,
  assets,
  setAssets,
  maintenanceData,
  setMaintenanceData,
  fmeaData,
  setFmeaData,
  rcaData,
  setRcaData,
  serviceProviders,
  setServiceProviders,
  handleAddAsset,
  handleAddMaintenanceTask,
  handleCompleteTask,
  handleCreateDemoData
}) {
  const navigate = useNavigate();

  return (
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
        path="/assets/import"
        element={
          <BulkAssetImportView
            user={user}
            onImportComplete={(newAssets) => {
              setAssets(prev => [...prev, ...newAssets]);
              navigate('/');
            }}
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

      {/* AI Feature Routes - All real components now available */}
      <Route
        path="/ai-insights"
        element={
          <AIProtectedRoute user={user}>
            <AIInsightsView assets={assets} />
          </AIProtectedRoute>
        }
      />

      <Route
        path="/ai-chat"
        element={
          <AIProtectedRoute user={user}>
            <AIChatView />
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
  );
}

export default MainRoutes;
