/**
 * Provider Auth Router
 * Manages navigation between Login and Signup screens
 * Phase 2 Sprint 5: Healthcare Provider Integration
 */

import React, { useState } from 'react';
import ProviderLogin from './ProviderLogin';
import ProviderSignup from './ProviderSignup';

const ProviderAuthRouter = ({ onAuthSuccess }) => {
  const [screen, setScreen] = useState('login'); // login, signup, forgot-password

  const handleLoginSuccess = (providerData) => {
    console.log('Provider logged in:', providerData);
    if (onAuthSuccess) {
      onAuthSuccess({ type: 'login', provider: providerData });
    }
  };

  const handleSignupSuccess = (providerData) => {
    console.log('Provider registered:', providerData);
    // After signup, show verification screen or auto-redirect to login
    if (onAuthSuccess) {
      onAuthSuccess({ type: 'signup', provider: providerData });
    }
    // Optionally redirect to login after brief delay
    setTimeout(() => setScreen('login'), 2000);
  };

  return (
    <>
      {screen === 'login' && (
        <ProviderLogin
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={() => setScreen('signup')}
          onNavigateToForgotPassword={() => setScreen('forgot-password')}
        />
      )}
      {screen === 'signup' && (
        <ProviderSignup
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={() => setScreen('login')}
        />
      )}
    </>
  );
};

export default ProviderAuthRouter;
