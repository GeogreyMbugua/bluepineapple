'use client';

import { usePathname } from 'next/navigation';
import { useSidebarContext } from '@/components/admin/layout/sidebar/sidebar-context';
import { MenuIcon } from '@/components/admin/layout/header/icons';
import { UserInfo } from '@/components/admin/layout/header/user-info';
import Image from 'next/image';

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/users')) return 'Users';
    if (pathname.startsWith('/admin/partners')) return 'Partners';
    if (pathname.startsWith('/admin/bookings')) return 'Bookings';
    if (pathname.startsWith('/admin/experiences')) return 'Experiences';
    if (pathname.startsWith('/admin/rewards')) return 'Rewards';
    return 'Admin';
  };

  return (
    <header className="border-stroke shadow-1 sticky top-0 z-30 flex items-center justify-between border-b border-l-[3px] border-l-primary bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="border border-stroke px-1.5 py-1 lg:hidden hover:bg-muted"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Image
          src="/brand/logo.png"
          alt="Blue Pineapple"
          width={32}
          height={32}
          className="2xsm:ml-4 ml-2 max-[430px]:hidden"
        />
      )}

      <div className="max-xl:hidden">
        <h1 className="text-heading-5 text-dark mb-0.5 font-bold">
          {getTitle()}
        </h1>
        <p className="font-medium text-dark-5">Blue Pineapple Admin</p>
      </div>

      <div className="2xsm:gap-4 flex flex-1 items-center justify-end gap-2">
        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}