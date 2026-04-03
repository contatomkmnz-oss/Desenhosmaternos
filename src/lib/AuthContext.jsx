import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  authForgotPassword,
  authLoginEmail,
  authLoginGoogle,
  authLogout,
  authSignUpEmail,
  subscribeFirebaseAuthState,
} from '@/lib/firebaseAuth';
import { firebaseEnabled } from '@/lib/firebase';
import { isAdmin as isAdminUser, withAdminRole } from '@/lib/authz';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'local', public_settings: {} });

  useEffect(() => {
    let cancelled = false;

    const syncAppUser = async (firebaseUser) => {
      setAuthError(null);
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      try {
        if (!firebaseEnabled && !base44.auth.isLoggedIn()) {
          if (!cancelled) {
            setCurrentUser(null);
            setUser(null);
            setIsAuthenticated(false);
            setAppPublicSettings({ id: 'local', public_settings: {} });
          }
          return;
        }

        const appUser = await base44.auth.me();
        if (!cancelled) {
          setCurrentUser(firebaseUser ?? appUser);
          setUser(withAdminRole(appUser));
          setIsAuthenticated(Boolean(firebaseUser) || base44.auth.isLoggedIn());
          setAppPublicSettings({ id: 'local', public_settings: {} });
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[KIDSPlay] auth.me', e);
        }
        if (!cancelled) {
          setCurrentUser(firebaseUser ?? null);
          setUser(null);
          setIsAuthenticated(Boolean(firebaseUser));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPublicSettings(false);
          setIsLoadingAuth(false);
        }
      }
    };

    const unsubscribe = subscribeFirebaseAuthState((firebaseUser) => {
      void syncAppUser(firebaseUser);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const firebaseUser = await authLoginGoogle();
    const appUser = await base44.auth.me();
    setCurrentUser(firebaseUser ?? appUser);
    setUser(withAdminRole(appUser));
    setIsAuthenticated(true);
    return firebaseUser ?? appUser;
  };

  const signInWithEmail = async (email, password) => {
    const firebaseUser = await authLoginEmail(email, password);
    const appUser = await base44.auth.me();
    setCurrentUser(firebaseUser ?? appUser);
    setUser(withAdminRole(appUser));
    setIsAuthenticated(true);
    return firebaseUser ?? appUser;
  };

  const signUpWithEmail = async (email, password) => {
    const firebaseUser = await authSignUpEmail(email, password);
    const appUser = await base44.auth.me();
    setCurrentUser(firebaseUser ?? appUser);
    setUser(withAdminRole(appUser));
    setIsAuthenticated(true);
    return firebaseUser ?? appUser;
  };

  const logout = async (shouldRedirect = true) => {
    setCurrentUser(null);
    setUser(null);
    setIsAuthenticated(false);
    await authLogout();
    if (shouldRedirect) {
      window.location.href = '/Login';
    }
  };

  const navigateToLogin = () => {
    console.info('[KIDSPlay] Login externo não usado no modo local.');
  };

  const checkAppState = async () => {
    /* compat: recarrega usuário do app local */
    try {
      const u = await base44.auth.me();
      setUser(withAdminRole(u));
      setCurrentUser((prev) => prev ?? u);
      setIsAuthenticated(base44.auth.isLoggedIn());
      setAuthError(null);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[KIDSPlay] checkAppState', e);
      }
    }
  };

  const value = useMemo(() => ({
    currentUser,
    user,
    isAdmin: isAdminUser(user),
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    loading: isLoadingAuth || isLoadingPublicSettings,
    authError,
    appPublicSettings,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    forgotPassword: authForgotPassword,
    logout,
    signOut: logout,
    navigateToLogin,
    checkAppState,
  }), [
    currentUser,
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
