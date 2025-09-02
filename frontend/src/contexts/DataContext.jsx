// frontend/src/contexts/DataContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { assetApi } from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    plan: "Professional", // Temporary override for testing
    assetLimit: 50,
    assetsUsed: 0,
  });

  // Load assets from API
  const loadAssets = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const assetsData = await assetApi.getAssets(filters);
      setAssets(assetsData);
      setUser(prev => ({ ...prev, assetsUsed: assetsData.length }));

      console.log('Assets loaded from API:', assetsData);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(err.message);

      // Fallback to empty array on error
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Load assets on component mount
  useEffect(() => {
    loadAssets();
  }, []);

  // Get asset by ID
  const getAssetById = (id) => {
    return assets.find(asset => asset.id === parseInt(id));
  };

  // Add new asset
  const addAsset = async (assetData) => {
    try {
      const newAsset = await assetApi.createAsset(assetData);
      setAssets(prev => [...prev, newAsset]);
      setUser(prev => ({ ...prev, assetsUsed: prev.assetsUsed + 1 }));
      return newAsset;
    } catch (err) {
      console.error('Failed to add asset:', err);
      throw err;
    }
  };

  // Update existing asset
  const updateAsset = async (assetId, assetData) => {
    try {
      const updatedAsset = await assetApi.updateAsset(assetId, assetData);
      setAssets(prev =>
        prev.map(asset =>
          asset.id === assetId ? updatedAsset : asset
        )
      );
      return updatedAsset;
    } catch (err) {
      console.error('Failed to update asset:', err);
      throw err;
    }
  };

  // Update asset status
  const updateAssetStatus = async (assetId, status) => {
    try {
      const updatedAsset = await assetApi.updateAssetStatus(assetId, status);
      setAssets(prev =>
        prev.map(asset =>
          asset.id === assetId ? updatedAsset : asset
        )
      );
      return updatedAsset;
    } catch (err) {
      console.error('Failed to update asset status:', err);
      throw err;
    }
  };

  // Delete asset
  const deleteAsset = async (assetId) => {
    try {
      await assetApi.deleteAsset(assetId);
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      setUser(prev => ({ ...prev, assetsUsed: prev.assetsUsed - 1 }));
    } catch (err) {
      console.error('Failed to delete asset:', err);
      throw err;
    }
  };

  // Add maintenance task to asset
  const addMaintenanceTask = async (assetId, taskData) => {
    try {
      const newTask = await assetApi.addMaintenanceTask(assetId, taskData);

      // Update local state
      setAssets(prev =>
        prev.map(asset => {
          if (asset.id === assetId) {
            return {
              ...asset,
              maintenanceTasks: [...(asset.maintenanceTasks || []), newTask]
            };
          }
          return asset;
        })
      );

      return newTask;
    } catch (err) {
      console.error('Failed to add maintenance task:', err);
      throw err;
    }
  };

  // Update maintenance task
  const updateMaintenanceTask = async (assetId, taskId, taskData) => {
    try {
      const updatedTask = await assetApi.updateMaintenanceTask(assetId, taskId, taskData);

      // Update local state
      setAssets(prev =>
        prev.map(asset => {
          if (asset.id === assetId) {
            return {
              ...asset,
              maintenanceTasks: asset.maintenanceTasks.map(task =>
                task.id === taskId ? updatedTask : task
              )
            };
          }
          return asset;
        })
      );

      return updatedTask;
    } catch (err) {
      console.error('Failed to update maintenance task:', err);
      throw err;
    }
  };

  // Get dashboard statistics
  const getDashboardStats = async () => {
    try {
      const dashboardData = await assetApi.getDashboardData();
      return dashboardData;
    } catch (err) {
      console.error('Failed to get dashboard data:', err);
      throw err;
    }
  };

  // Filter assets by various criteria
  const getAssetsByStatus = (status) => {
    return assets.filter(asset => asset.status === status);
  };

  const getAssetsByCondition = (condition) => {
    return assets.filter(asset => asset.condition === condition);
  };

  const getAssetsByType = (type) => {
    return assets.filter(asset => asset.type === type);
  };

  const getAssetsByLocation = (location) => {
    return assets.filter(asset => asset.location === location);
  };

  // Get assets with overdue maintenance
  const getAssetsWithOverdueMaintenance = () => {
    const now = new Date();
    return assets.filter(asset => {
      if (!asset.maintenanceTasks) return false;
      return asset.maintenanceTasks.some(task =>
        task.status !== 'completed' &&
        new Date(task.dueDate) < now
      );
    });
  };

  // Get assets with upcoming maintenance (next 7 days)
  const getAssetsWithUpcomingMaintenance = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return assets.filter(asset => {
      // Check next service date
      if (asset.nextServiceDate) {
        const serviceDate = new Date(asset.nextServiceDate);
        if (serviceDate >= now && serviceDate <= sevenDaysFromNow) {
          return true;
        }
      }

      // Check maintenance tasks
      if (asset.maintenanceTasks) {
        return asset.maintenanceTasks.some(task => {
          if (task.status === 'completed') return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= now && dueDate <= sevenDaysFromNow;
        });
      }

      return false;
    });
  };

  // Refresh data
  const refreshData = () => {
    loadAssets();
  };

  const value = {
    // State
    assets,
    loading,
    error,
    user,

    // Asset operations
    getAssetById,
    addAsset,
    updateAsset,
    updateAssetStatus,
    deleteAsset,
    refreshData,
    loadAssets,

    // Maintenance operations
    addMaintenanceTask,
    updateMaintenanceTask,

    // Dashboard
    getDashboardStats,

    // Filtering functions
    getAssetsByStatus,
    getAssetsByCondition,
    getAssetsByType,
    getAssetsByLocation,
    getAssetsWithOverdueMaintenance,
    getAssetsWithUpcomingMaintenance,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
