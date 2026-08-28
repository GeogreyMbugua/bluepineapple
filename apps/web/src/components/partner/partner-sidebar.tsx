'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PARTNER_NAV } from '@/config/navigation';
import { publicPath } from '@/lib/paths';
import { useSession } from '@/providers/session-provider';
import { cn } from '@/lib/utils';

interface PartnerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PartnerSidebar({ isOpen = false, onClose }: PartnerSidebarProps) {
  const pathname = usePathname();
  const { logout } = useSession();
  const [isNavigating, setIsNavigating] = useState(false);

  const isActive = (href: string) => {
    if (href === '/partner') {
      return pathname === href || pathname === '/partner/(dashboard)';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNavClick = () => {
    if (onClose) onClose();
    setIsNavigating(true);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNavigating(false);
  }, [pathname]);

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-stroke bg-white transition-transform duration-300 ease-in-out',
          'md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="p-6 border-b border-stroke">
          <Link href="/partner" className="flex items-center gap-3 group" onClick={handleNavClick}>
            <Image src={publicPath('/brand/logo.png')} alt="Blue Pineapple" width={32} height={32} className="size-8" />
            <div>
              <h2 className="text-base font-semibold text-dark">Partner Portal</h2>
              <p className="text-[11px] text-dark-6 uppercase tracking-wider">Management</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {PARTNER_NAV.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="px-3 text-[11px] font-semibold text-dark-6 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      aria-current={active ? 'page' : undefined}
                      aria-busy={isNavigating}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2',
                        active
                          ? 'bg-cyan/10 text-primary-deep'
                          : 'text-dark-5 hover:bg-muted hover:text-dark-4',
                        isNavigating && 'pointer-events-none opacity-50',
                      )}
                    >
                      {active && (
                        <span className="w-1 h-4 bg-primary rounded-full shrink-0" />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-stroke">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red hover:text-red-dark transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1={21} y1={12} x2={9} y2={12} />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
