import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi, register as registerApi, getProfile } from '../api/auth';
import { setAuthToken } from '../api/client';

const AuthContext = createContext();

const STORAGE_KEY = 'fashion-mobile-auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.token) {
            setAuthToken(parsed.token);
            setToken(parsed.token);
          }
          if (parsed?.user) {
            setUser(parsed.user);
          }
          if (parsed?.token) {
            try {
              const refreshed = await getProfile();
              setUser(refreshed);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user: refreshed }));
            } catch (err) {
              console.warn('Unable to refresh profile on boot', err?.message);
            }
          }
        }
      } catch (err) {
        console.warn('Auth bootstrap error', err);
      } finally {
        setHydrated(true);
      }
    };
    bootstrap();
  }, []);

  const persistSession = async (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const handleAuthError = (error) => {
    const message = error?.response?.data?.error || error?.message || 'Something went wrong';
    setAuthError(message);
    setTimeout(() => setAuthError(null), 3000);
    return Promise.reject(new Error(message));
  };

  const login = async ({ email, password }) => {
    try {
      const data = await loginApi({ email, password });
      await persistSession(data.token, data.user);
      return data.user;
    } catch (err) {
      return handleAuthError(err);
    }
  };

  const register = async ({ name, email, password, role = 'customer' }) => {
    try {
      const data = await registerApi({ name, email, password, role });
      await persistSession(data.token, data.user);
      return data.user;
    } catch (err) {
      return handleAuthError(err);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const profile = await getProfile();
    setUser(profile);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: profile }));
    return profile;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading: !hydrated,
      authError,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, hydrated, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
