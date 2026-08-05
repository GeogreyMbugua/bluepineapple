'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/providers/session-provider';

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/experiences', label: 'Experiences' },
  { href: '/admin/fleet', label: 'Fleet' },
];

export function AdminSidebar({
  user,
}: {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    roles: string[];
  };
}) {
  const pathname = usePathname();
  const { logout } = useSession();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 border-r border-stroke bg-white flex flex-col">
      <div className="p-4 border-b border-stroke">
        <h2 className="text-lg font-semibold text-dark">Admin Portal</h2>
        <p className="text-sm text-dark-5">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-dark-6">{user.roles.join(', ')}</p>
      </div>
      <nav className="space-y-1 px-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? 'bg-cyan/10 text-primary-deep'
                : 'text-dark-5 hover:bg-muted hover:text-dark-4'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-stroke">
        <button
          onClick={handleLogout}
          className="text-sm text-red hover:text-red-dark"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
