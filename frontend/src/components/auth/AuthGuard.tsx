'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  hydrateToken,
  setCredentials,
  setInitialized,
  setAuthLoading,
  logout,
} from '@/store/authSlice';
import { authService } from '@/services/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { initialized, isAuthenticated, token } = useAppSelector(
    (s) => s.auth
  );

  useEffect(() => {
    const init = async () => {
      dispatch(hydrateToken());
      const stored = localStorage.getItem('veda_token');

      if (!stored) {
        dispatch(setInitialized(true));
        router.replace('/login');
        return;
      }

      dispatch(setAuthLoading(true));
      try {
        const res = await authService.me();
        dispatch(
          setCredentials({ user: res.data.user, token: stored })
        );
      } catch {
        dispatch(logout());
        router.replace('/login');
      } finally {
        dispatch(setAuthLoading(false));
        dispatch(setInitialized(true));
      }
    };

    init();
  }, [dispatch, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full mx-auto" />
          <p className="text-brand-muted mt-4 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}
