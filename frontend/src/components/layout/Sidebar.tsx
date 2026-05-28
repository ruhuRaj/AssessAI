'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogoIcon, HomeIcon, AssignmentsIcon, SparkleIcon } from '@/components/icons';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useAppSelector } from '@/store/hooks';
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand';

const NAV = [
  { href: '/', label: 'Home', icon: HomeIcon },
  {
    href: '/assignments',
    label: 'All Assignments',
    icon: AssignmentsIcon,
    showCount: true,
  },
  { href: '/create', label: 'Create Assignment', icon: SparkleIcon, highlight: true },
];

interface SidebarProps {
  assignmentCount?: number;
}

export function Sidebar({ assignmentCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  const isAssignmentsSection =
    pathname === '/assignments' ||
    pathname.startsWith('/generate') ||
    pathname.startsWith('/paper');

  return (
    <aside className="dashboard-chrome hidden lg:flex flex-col w-64 shrink-0 bg-brand-surface border-r border-brand-border min-h-screen p-4">
      <Link href="/" className="flex items-center gap-2 px-2 mb-6">
        <LogoIcon />
        <span className="font-bold text-lg text-brand-dark">{BRAND_NAME}</span>
      </Link>

      <p className="px-2 text-xs text-brand-muted mb-3 leading-relaxed">
        {BRAND_TAGLINE}
      </p>

      <Link
        href="/create"
        className="mb-4 flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-dark text-white text-xs font-semibold py-2 px-3 hover:bg-black transition"
      >
        <SparkleIcon className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
        New Assignment
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/'
              ? pathname === '/'
              : item.href === '/assignments'
                ? isAssignmentsSection
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                'sidebar-link',
                active && 'sidebar-link-active',
                item.highlight && !active && 'text-brand-orange'
              )}
            >
              <Icon />
              {item.label}
              {'showCount' in item &&
                item.showCount &&
                assignmentCount > 0 && (
                  <span className="ml-auto bg-brand-orange text-white text-xs font-bold min-w-[1.25rem] text-center px-1.5 py-0.5 rounded-full">
                    {assignmentCount}
                  </span>
                )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-brand-border">
        <Link
          href="/profile"
          className={clsx(
            'flex items-center gap-3 p-3 rounded-xl bg-white border border-brand-border hover:border-brand-orange/40 transition-colors',
            pathname === '/profile' && 'ring-2 ring-brand-orange/30'
          )}
        >
          <UserAvatar
            name={user?.name}
            imageUrl={user?.profileImageUrl}
            size="md"
            className="rounded-lg"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-dark truncate">
              {user?.name || 'Profile'}
            </p>
            <p className="text-[10px] text-brand-muted leading-tight truncate">
              {user?.schoolName || 'View profile'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
