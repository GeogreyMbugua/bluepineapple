'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/features/auth/types';
import { getCurrentUser } from '@/features/auth/services';
import { useClerk } from '@clerk/nextjs';
import { getSignInPath, hasPartnerRole } from '@/lib/auth/portals';

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
  const router = useRouter();
  const { signOut: clerkSignOut } = useClerk();

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

  const handleLogout = async () => {
    const portal = user && hasPartnerRole(user.roles) ? 'partner' : 'admin';

    try {
      await clerkSignOut();
    } catch {
      // best-effort
    }

    setUser(null);
    setExpiresAt(null);
    router.push(getSignInPath(portal));
  };

  const value: SessionContextValue = {
    user,
    expiresAt,
    isAuthenticated: !!user,
    isLoading,
    refresh: async () => {
      setLoading(true);
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } finally {
        setLoading(false);
      }
    },
    logout: handleLogout,
    updateUser: setUser,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
