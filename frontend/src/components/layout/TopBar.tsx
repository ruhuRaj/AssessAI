'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { BellIcon, ChevronDownIcon, LogoIcon } from '@/components/icons';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/authSlice';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function TopBar({
  title = 'Assignment',
  showBack = false,
  backHref = '/',
}: TopBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      /* server logout is optional */
    }
    dispatch(logoutAction());
    toast.success('Signed out');
    router.replace('/login');
  };

  return (
    <header className="dashboard-chrome flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-brand-border bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="lg:hidden shrink-0">
          <LogoIcon className="w-8 h-8" />
        </Link>
        {showBack && (
          <Link
            href={backHref}
            className="p-2 rounded-lg hover:bg-brand-surface text-brand-muted"
            aria-label="Back"
          >
            ←
          </Link>
        )}
        <h1 className="font-semibold text-brand-dark truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-brand-surface text-brand-muted"
          aria-label="Notifications"
        >
          <BellIcon />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 pl-0.5 pr-1.5 py-0.5 rounded-full hover:bg-brand-surface"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <UserAvatar
              name={user?.name}
              imageUrl={user?.profileImageUrl}
              size="sm"
            />
            <span className="hidden sm:inline text-sm font-medium text-brand-dark max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDownIcon
              className={clsx(
                'w-3 h-3 shrink-0 text-brand-muted transition-transform',
                menuOpen && 'rotate-180'
              )}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white border border-brand-border rounded-xl shadow-lg py-1 z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-brand-border">
                <p className="text-sm font-semibold text-brand-dark truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-brand-muted truncate">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                className="block px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-surface"
                onClick={() => setMenuOpen(false)}
              >
                Profile settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
