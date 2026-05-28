'use client';

import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  assignmentCount?: number;
}

export function DashboardLayout({
  children,
  assignmentCount = 0,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-surface flex">
      <Sidebar assignmentCount={assignmentCount} />
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {children}
      </div>
      <MobileNav assignmentCount={assignmentCount} />
      <Link
        href="/create"
        className="dashboard-chrome lg:hidden fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-white border-2 border-brand-orange shadow-lg flex items-center justify-center text-brand-orange text-2xl font-light"
        aria-label="Create Assignment"
      >
        +
      </Link>
    </div>
  );
}
