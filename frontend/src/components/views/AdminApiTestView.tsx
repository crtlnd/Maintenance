// frontend/src/components/views/AdminApiTestView.tsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminApiTestView() {
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const testEndpoint = async (name: string, endpoint: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { status: 'success', data: data };
      } else {
        return { status: 'error', error: `${response.status} ${response.statusText}` };
      }
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults({});

    const tests = [
      { name: 'Backend Health', endpoint: '/health' },
      { name: 'Admin Dashboard', endpoint: '/admin/dashboard' },
      { name: 'Admin Users', endpoint: '/admin/users' },
      { name: 'Admin Assets', endpoint: '/admin/assets' },
      { name: 'Admin Providers', endpoint: '/admin/providers' },
    ];

    for (const test of tests) {
      const result = await testEndpoint(test.name, test.endpoint);
      setTestResults((prev: any) => ({
        ...prev,
        [test.name]: result
      }));
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const getStatusIcon = (result: any) => {
    if (!result) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (result.status === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (result: any) => {
    if (!result) return 'text-gray-500';
    if (result.status === 'success') return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">API Connection Test</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Backend Configuration</h2>
          <button
            onClick={runTests}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <span>Run Tests</span>
            )}
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
          <p><strong>Auth Token:</strong> {localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken') ? 'Present' : 'Not found'}</p>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Backend Health', endpoint: '/health' },
            { name: 'Admin Dashboard', endpoint: '/admin/dashboard' },
            { name: 'Admin Users', endpoint: '/admin/users' },
            { name: 'Admin Assets', endpoint: '/admin/assets' },
            { name: 'Admin Providers', endpoint: '/admin/providers' },
          ].map((test) => {
            const result = testResults[test.name];
            return (
              <div key={test.name} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result)}
                  <div>
                    <div className="font-medium text-gray-900">{test.name}</div>
                    <div className="text-sm text-gray-500">{test.endpoint}</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(result)}`}>
                  {result ? (
                    result.status === 'success' ? (
                      'Connected'
                    ) : (
                      result.error
                    )
                  ) : testing ? (
                    'Testing...'
                  ) : (
                    'Not tested'
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Results</h2>
          <div className="space-y-4">
            {Object.entries(testResults).map(([name, result]: [string, any]) => (
              <div key={name} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{name}</h3>
                  <span className={`text-sm font-medium ${getStatusColor(result)}`}>
                    {result.status}
                  </span>
                </div>
                {result.status === 'success' && result.data && (
                  <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                {result.status === 'error' && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Make sure your backend is running on the correct port</li>
          <li>2. Verify your admin routes exist in backend/routes/admin.js</li>
          <li>3. Check that admin routes are properly mounted in your main server file</li>
          <li>4. Ensure authentication middleware is working</li>
          <li>5. Test individual endpoints and fix any that are failing</li>
        </ul>
      </div>
    </div>
  );
}
