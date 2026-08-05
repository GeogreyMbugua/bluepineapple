'use client';

import { useSession } from '@/providers/session-provider';
import { MobileBottomNav } from './mobile-bottom-nav';
import { Menu } from 'lucide-react';

interface PartnerHeaderProps {
  onMenuClick: () => void;
}

export function PartnerHeader({ onMenuClick }: PartnerHeaderProps) {
  const { user, logout } = useSession();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stroke bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden p-1 -ml-1 text-dark hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <p className="text-sm font-medium text-dark">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
              </p>
              <p className="text-xs text-dark-6 md:hidden">Partner</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-red hover:text-red-dark transition-colors hidden md:block"
          >
            Sign out
          </button>
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
}
