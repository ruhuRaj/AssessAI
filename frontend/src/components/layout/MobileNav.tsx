'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { HomeIcon, AssignmentsIcon, SparkleIcon } from '@/components/icons';

interface MobileNavProps {
  assignmentCount?: number;
}

const ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  {
    href: '/assignments',
    label: 'Assignments',
    icon: AssignmentsIcon,
    showCount: true,
  },
  { href: '/create', label: 'Create', icon: SparkleIcon },
];

export function MobileNav({ assignmentCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  const isAssignmentsSection =
    pathname === '/assignments' ||
    pathname.startsWith('/generate') ||
    pathname.startsWith('/paper');

  return (
    <nav className="dashboard-chrome lg:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-dark text-white safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {ITEMS.map((item) => {
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
                'relative flex flex-col items-center gap-0.5 text-xs min-w-[4rem]',
                active ? 'text-white' : 'text-white/50'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {'showCount' in item &&
                item.showCount &&
                assignmentCount > 0 && (
                  <span className="absolute -top-0.5 right-2 min-w-[1rem] h-4 px-1 text-[10px] font-bold bg-brand-orange text-white rounded-full flex items-center justify-center">
                    {assignmentCount > 99 ? '99+' : assignmentCount}
                  </span>
                )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
