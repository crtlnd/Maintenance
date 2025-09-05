import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

const caseyUptimeLogo = null; // Temporarily remove logo

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const inviteToken = searchParams.get('inviteToken'); // NEW: Get invite token
  const [isLogin, setIsLogin] = useState(mode === 'login');

  useEffect(() => {
    console.log('Query param mode:', mode);
    console.log('Query param inviteToken:', inviteToken); // NEW: Log invite token
    setIsLogin(mode === 'login');
  }, [mode, inviteToken]);

  const handleSwitchToSignup = () => {
    console.log('Switching to signup');
    // NEW: Preserve inviteToken when switching modes
    const params = { mode: 'signup' };
    if (inviteToken) {
      params.inviteToken = inviteToken;
    }
    setSearchParams(params);
  };

  const handleSwitchToLogin = () => {
    console.log('Switching to login');
    // NEW: Preserve inviteToken when switching modes
    const params = { mode: 'login' };
    if (inviteToken) {
      params.inviteToken = inviteToken;
    }
    setSearchParams(params);
  };

  console.log('Rendering AuthPage: isLogin=', isLogin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col items-center justify-center p-4">
      <nav className="w-full max-w-4xl mx-auto border-b bg-white/80 backdrop-blur-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {caseyUptimeLogo ? (
                <img
                  src={caseyUptimeLogo}
                  alt="Casey Uptime"
                  className="h-10 w-auto"
                />
              ) : (
                <div className="h-10 w-auto flex items-center justify-center text-sm font-semibold">
                  Casey Uptime
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold text-foreground">Maintenance Manager</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button
                onClick={isLogin ? handleSwitchToSignup : handleSwitchToLogin}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* NEW: Show invitation context if inviteToken exists */}
      {inviteToken && (
        <div className="w-full max-w-md mb-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">🎉</span>
              <h3 className="font-semibold text-blue-900">Organization Invitation</h3>
            </div>
            <p className="text-blue-800 text-sm">
              You're {isLogin ? 'signing in' : 'signing up'} to join an organization!
              {!isLogin && ' Complete your registration below.'}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {console.log('Rendering component:', isLogin ? 'LoginForm' : 'SignupForm')}
        {isLogin ? (
          <LoginForm
            onSwitchToSignup={handleSwitchToSignup}
            inviteToken={inviteToken} // NEW: Pass invite token to LoginForm
          />
        ) : (
          <SignupForm
            onSwitchToLogin={handleSwitchToLogin}
            inviteToken={inviteToken} // NEW: Pass invite token to SignupForm
          />
        )}
      </div>
    </div>
  );
}

// Add this component to your AuthPage.tsx temporarily for debugging
const DebugStorageClear = () => {
  const clearStorage = () => {
    localStorage.removeItem('maintenanceManager_user');
    localStorage.removeItem('token');
    console.log('Storage cleared! Refresh the page.');
    window.location.reload();
  };

  return (
    <div className="mb-4 p-2 bg-red-100 border rounded">
      <p className="text-sm text-red-600 mb-2">Debug: Clear authentication data</p>
      <button
        onClick={clearStorage}
        className="text-xs bg-red-500 text-white px-2 py-1 rounded"
      >
        Clear Storage & Reload
      </button>
    </div>
  );
};

// Then add <DebugStorageClear /> to your AuthPage component
// Remove this once authentication is working properly
