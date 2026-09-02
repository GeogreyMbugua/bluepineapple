'use client';

import { ChevronUpIcon } from '@/components/admin/icons';
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from '@/components/admin/ui/dropdown';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSession } from '@/providers/session-provider';
import { LogOutIcon, UserIcon } from './icons';

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useSession();

  async function handleLogout() {
    setIsOpen(false);
    await logout();
  }

  const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'Admin' : 'Admin';
  const userEmail = user?.email || '';

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="cursor-pointer align-middle ring-primary ring-offset-2 outline-none focus-visible:ring-1">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center bg-muted text-dark">
            <UserIcon />
          </span>
          <figcaption className="flex items-center gap-1 font-medium text-dark max-[1024px]:sr-only">
            <span className="max-w-24 truncate">{userName}</span>
            <ChevronUpIcon
              aria-hidden
              className={cn(
                'rotate-180 transition-transform',
                isOpen && 'rotate-0',
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md min-[230px]:min-w-70"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center bg-muted text-dark">
            <UserIcon />
          </span>

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark">
              {userName}
            </div>
            <div className="w-full max-w-47.5 truncate leading-none text-dark-6">
              {userEmail}
            </div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8]" />

        <div className="p-2 text-base text-dark-6">
          <button
            className="flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2.25 ring-primary outline-0 hover:bg-muted hover:text-dark focus-visible:ring-1"
            onClick={handleLogout}
          >
            <LogOutIcon />
            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
