'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { buildNavData, getIconComponent, type NavItem } from './data';
import { ArrowLeftIcon } from './icons';
import { MenuItem } from './menu-item';
import { useSidebarContext } from './sidebar-context';
import { useSession } from '@/providers/session-provider';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [manuallyExpanded, setManuallyExpanded] = useState<string[]>([]);
  const { user } = useSession();

  const navData = useMemo(() => buildNavData(user), [user]);

  const toggleExpanded = (title: string) => {
    setManuallyExpanded((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  };

  const expandedItems = useMemo(() => {
    const expanded = new Set(manuallyExpanded);
    for (const section of navData) {
      for (const item of section.items) {
        if (item.items?.some((subItem) => subItem.href === pathname)) {
          expanded.add(item.title);
        }
      }
    }
    return Array.from(expanded);
  }, [manuallyExpanded, pathname, navData]);

  const renderItem = (item: NavItem) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isActive = !hasSubItems && item.href === pathname;

    if (hasSubItems) {
      return (
        <div key={item.title}>
          <MenuItem
            isActive={item.items!.some((sub) => sub.href === pathname)}
            onClick={() => toggleExpanded(item.title)}
          >
            {getIconComponent(item.icon)}
            <span>{item.title}</span>
          </MenuItem>

          {expandedItems.includes(item.title) && (
            <ul className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2" role="menu">
              {item.items!.map((subItem) => (
                <li key={subItem.title} role="none">
                  <MenuItem
                    as="link"
                    href={subItem.href!}
                    isActive={pathname === subItem.href}
                  >
                    <span>{subItem.title}</span>
                  </MenuItem>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    const href = item.href || '/';

    return (
      <MenuItem
        key={item.title}
        className="flex items-center gap-3 py-3"
        as="link"
        href={href}
        isActive={isActive}
      >
        {getIconComponent(item.icon)}
        <span>{item.title}</span>
      </MenuItem>
    );
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'max-w-[290px] overflow-hidden border-r border-stroke bg-white transition-width duration-200 ease-linear',
          isMobile ? 'fixed bottom-0 top-0 z-50' : 'sticky top-0 h-screen',
          isOpen ? 'w-full' : 'w-0',
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href="/admin"
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Image
                src="/brand/logo.png"
                alt="Blue Pineapple"
                width={32}
                height={32}
                className="size-8"
              />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {navData.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-dark-5">
                  {section.label}
                </h2>
                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => renderItem(item))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
