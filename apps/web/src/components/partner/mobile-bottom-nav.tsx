'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PARTNER_NAV } from '@/config/navigation';
import { Home, Calendar, Gift, Settings } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  calendar: Calendar,
  'bar-chart': Calendar,
  gift: Gift,
  settings: Settings,
  truck: Calendar,
  'trending-up': Calendar,
};

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/partner') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const flatItems = PARTNER_NAV.flatMap((group) => group.items);

  const getIcon = (iconName: string): React.ElementType => {
    const icon = iconMap[iconName];
    return icon || Home;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stroke bg-white md:hidden">
      <div className="flex items-center justify-around">
        {flatItems.map((item) => {
          const active = isActive(item.href);
          const IconComponent = getIcon(item.icon ?? '');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors duration-200 ${
                active ? 'text-primary-deep' : 'text-dark-5'
              }`}
            >
              <IconComponent size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
