import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  authForgotPassword,
  authLoginEmail,
  authLoginGoogle,
  authLogout,
  authSignUpEmail,
  getFirebaseCurrentUser,
  subscribeFirebaseAuthState,
} from '@/lib/firebaseAuth';
import { firebaseEnabled } from '@/lib/firebase';
import { isAdmin as isAdminUser, withAdminRole } from '@/lib/authz';

const AuthContext = createContext();

function serializeProviderData(providerData = []) {
  return providerData.map((provider) => ({
    providerId: provider?.providerId || null,
    uid: provider?.uid || null,
    email: provider?.email || null,
    displayName: provider?.displayName || null,
    phoneNumber: provider?.phoneNumber || null,
    photoURL: provider?.photoURL || null,
  }));
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'local', public_settings: {} });

  const resolveSessionUser = async (firebaseUser, appUser) => {
    if (!firebaseUser && !appUser) return null;

    let claims = appUser?.claims || appUser?.customClaims || null;

    if (!claims && firebaseUser?.getIdTokenResult) {
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        claims = tokenResult?.claims || null;
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[KIDSPlay] getIdTokenResult', e);
        }
      }
    }

    return withAdminRole({
      ...(appUser || {}),
      uid: firebaseUser?.uid || appUser?.uid,
      email: firebaseUser?.email || appUser?.email,
      name: appUser?.name || firebaseUser?.displayName || '',
      full_name: appUser?.full_name || firebaseUser?.displayName || '',
      avatar_url: appUser?.avatar_url || firebaseUser?.photoURL || '',
      photoURL: firebaseUser?.photoURL || appUser?.photoURL || '',
      providerData: firebaseUser?.providerData
        ? serializeProviderData(firebaseUser.providerData)
        : (appUser?.providerData || []),
      claims,
      customClaims: claims,
      auth_provider:
        firebaseUser?.providerData?.[0]?.providerId ||
        appUser?.auth_provider ||
        'password',
    });
  };

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
        const sessionUser = await resolveSessionUser(firebaseUser, appUser);
        if (!cancelled) {
          setCurrentUser(sessionUser);
          setUser(sessionUser);
          setIsAuthenticated(Boolean(firebaseUser) || base44.auth.isLoggedIn());
          setAppPublicSettings({ id: 'local', public_settings: {} });
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[KIDSPlay] auth.me', e);
        }
        if (!cancelled) {
          const fallbackUser = await resolveSessionUser(firebaseUser, null);
          setCurrentUser(fallbackUser);
          setUser(fallbackUser);
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
    const sessionUser = await resolveSessionUser(firebaseUser, appUser);
    setCurrentUser(sessionUser);
    setUser(sessionUser);
    setIsAuthenticated(true);
    return sessionUser;
  };

  const signInWithEmail = async (email, password) => {
    const firebaseUser = await authLoginEmail(email, password);
    const appUser = await base44.auth.me();
    const sessionUser = await resolveSessionUser(firebaseUser, appUser);
    setCurrentUser(sessionUser);
    setUser(sessionUser);
    setIsAuthenticated(true);
    return sessionUser;
  };

  const signUpWithEmail = async (email, password) => {
    const firebaseUser = await authSignUpEmail(email, password);
    const appUser = await base44.auth.me();
    const sessionUser = await resolveSessionUser(firebaseUser, appUser);
    setCurrentUser(sessionUser);
    setUser(sessionUser);
    setIsAuthenticated(true);
    return sessionUser;
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
      const sessionUser = await resolveSessionUser(getFirebaseCurrentUser(), u);
      setUser(sessionUser);
      setCurrentUser((prev) => prev ?? sessionUser);
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
