import React from 'react';
import { LandingPage } from './LandingPage';

// Demo component to showcase the landing page
export function LandingPageDemo() {
  return (
    <LandingPage 
      onGetStarted={() => alert('Get Started clicked! This would normally take you to signup.')}
      onLogin={() => alert('Login clicked! This would normally take you to the login form.')}
    />
  );
}