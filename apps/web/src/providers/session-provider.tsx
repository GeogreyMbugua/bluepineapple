'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@/features/auth/types';
import { getCurrentUser } from '@/features/auth/services';
import { useAuth, useClerk } from '@clerk/nextjs';
import { getSignInPath, hasPartnerRole } from '@/lib/auth/portals';

interface SessionContextValue {
  readonly user: AuthUser | null;
  readonly expiresAt: number | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly refresh: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly updateUser: (user: AuthUser | null) => void;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: true,
  refresh: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    const userData = await getCurrentUser();
    return userData ?? null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();
  const { signOut: clerkSignOut } = useClerk();
  const { isLoaded, userId } = useAuth();

  // Re-fetch whenever Clerk auth state changes (fixes post-login soft redirects
  // where this provider already mounted while signed out).
  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    void (async () => {
      if (!userId) {
        if (!cancelled) {
          setUser(null);
          setExpiresAt(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const userData = await loadCurrentUser();
      if (cancelled) return;

      // Prefer /api/auth/me when it succeeds. If it fails, keep any server-hydrated
      // user so the sidebar/header do not fall back to empty/"Admin".
      if (userData) {
        setUser(userData);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

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

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await loadCurrentUser();
      setUser(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: SessionContextValue = {
    user,
    expiresAt,
    isAuthenticated: !!user,
    isLoading,
    refresh,
    logout: handleLogout,
    updateUser: setUser,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Sync a server-resolved AuthUser into the client session before paint.
 * Portal layouts already call requirePortalSession — pass that user here so
 * other client consumers of useSession() see the user immediately.
 */
export function SessionHydrator({
  user,
}: {
  readonly user: AuthUser;
}) {
  const { updateUser } = useSession();

  useLayoutEffect(() => {
    updateUser(user);
  }, [user, updateUser]);

  return null;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
