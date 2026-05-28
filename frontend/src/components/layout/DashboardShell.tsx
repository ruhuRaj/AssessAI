'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { assignmentService } from '@/services/api';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    assignmentService
      .list()
      .then((res) => setCount(res.data.assignments?.length ?? 0))
      .catch(() => setCount(0));
  }, []);

  return <DashboardLayout assignmentCount={count}>{children}</DashboardLayout>;
}
