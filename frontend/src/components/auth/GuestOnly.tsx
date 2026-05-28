'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirect to dashboard if user already has a stored token */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('veda_token');
    if (token) {
      router.replace('/');
    }
  }, [router]);

  return <>{children}</>;
}
