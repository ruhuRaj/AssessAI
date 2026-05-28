'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { OtpInput } from '@/components/auth/OtpInput';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

type Step = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your email');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success('If an account exists, a code was sent. Check email or backend console in dev.');
      setStep('reset');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({ email, otp, newPassword });
      toast.success('Password updated! Sign in with your new password.');
      router.replace('/login');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'reset') {
    return (
      <AuthFormLayout
        title="Reset password"
        subtitle={`Enter the code sent to ${email}`}
        footer={
          <Link href="/login" className="text-brand-orange font-semibold hover:underline">
            Back to sign in
          </Link>
        }
      >
        <form onSubmit={handleReset} className="space-y-5">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              New password
            </label>
            <input
              type="password"
              className="ui-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ui-btn-primary w-full py-3"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-sm text-brand-muted hover:text-brand-dark"
          >
            Use a different email
          </button>
        </form>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Forgot password"
      subtitle="We will email you a reset code"
      footer={
        <Link href="/login" className="text-brand-orange font-semibold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSendCode} className="space-y-4">
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
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full py-3"
        >
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
