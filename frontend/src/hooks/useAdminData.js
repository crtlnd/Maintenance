// frontend/src/hooks/useAdminData.js
import { useState, useEffect, useCallback } from 'react';
import adminApi from '../../Services/adminApi';

// Generic hook for API data fetching
export function useApiData(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for each admin section
export function useDashboardStats() {
  return useApiData(() => adminApi.getDashboardStats());
}

export function useUsers(page = 1, limit = 50) {
  return useApiData(() => adminApi.getUsers(page, limit), [page, limit]);
}

export function useAssets(page = 1, limit = 50) {
  return useApiData(() => adminApi.getAssets(page, limit), [page, limit]);
}

export function useProviders(page = 1, limit = 50) {
  return useApiData(() => adminApi.getProviders(page, limit), [page, limit]);
}

export function usePayments(page = 1, limit = 50) {
  return useApiData(() => adminApi.getPayments(page, limit), [page, limit]);
}

export function useAnalytics(timeRange = '30d') {
  return useApiData(() => adminApi.getAnalytics(timeRange), [timeRange]);
}

export function useMatchingConfig() {
  return useApiData(() => adminApi.getMatchingConfig());
}

export function useMetrics() {
  return useApiData(() => adminApi.getMetrics());
}

// Hook for mutations (create, update, delete)
export function useAdminMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
