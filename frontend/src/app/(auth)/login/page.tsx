'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { authService } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login({ email, password });
      dispatch(
        setCredentials({
          user: res.data.user,
          token: res.data.token,
        })
      );
      toast.success('Welcome back!');
      router.replace('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Sign in"
      subtitle="Access your assessment workspace"
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="text-brand-orange font-semibold hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Email
          </label>
          <input
            type="email"
            className="ui-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.edu"
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-brand-dark">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-orange font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            className="ui-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full py-3 mt-2"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
