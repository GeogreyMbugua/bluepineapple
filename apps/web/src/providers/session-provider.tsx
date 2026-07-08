'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/features/auth/types';
import { getCurrentUser, refreshSession, logout } from '@/features/auth/services';

interface SessionContextValue {
  readonly user: AuthUser | null;
  readonly expiresAt: number | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly refresh: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly updateUser: (user: AuthUser) => void;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: false,
  refresh: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function SessionProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        // No valid session
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await refreshSession();
      if (result) {
        setUser(result.user);
        setExpiresAt(result.expiresAt);
      } else {
        setUser(null);
        setExpiresAt(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setExpiresAt(null);
  };

  const value: SessionContextValue = {
    user,
    expiresAt,
    isAuthenticated: !!user,
    isLoading,
    refresh: handleRefresh,
    logout: handleLogout,
    updateUser: setUser,
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}