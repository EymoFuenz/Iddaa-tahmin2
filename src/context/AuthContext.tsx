/**
 * Auth Context
 * Firebase Auth ile giriş durumu ve login/logout
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code: string }).code === 'auth/invalid-credential' || (err as { code: string }).code === 'auth/user-not-found'
            ? 'E-posta veya şifre hatalı.'
            : (err as { message?: string }).message || 'Giriş yapılamadı.'
          : 'Giriş yapılamadı.';
      setAuthError(message);
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code: string }).code === 'auth/email-already-in-use'
            ? 'Bu e-posta adresi zaten kullanılıyor.'
            : (err as { code: string }).code === 'auth/weak-password'
              ? 'Şifre en az 6 karakter olmalı.'
              : (err as { message?: string }).message || 'Kayıt oluşturulamadı.'
          : 'Kayıt oluşturulamadı.';
      setAuthError(message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await firebaseSignOut(auth);
  };

  const clearAuthError = () => setAuthError(null);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    authError,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
