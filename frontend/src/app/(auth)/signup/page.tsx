'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { OtpInput } from '@/components/auth/OtpInput';
import { authService } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import toast from 'react-hot-toast';

type Step = 'details' | 'otp';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await authService.signupSendOtp({
        name: form.name,
        email: form.email,
        password: form.password,
        schoolName: form.schoolName || undefined,
      });
      toast.success('Verification code sent! Check your email.');
      setStep('otp');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.signupVerify({
        email: form.email,
        otp,
      });
      dispatch(
        setCredentials({
          user: res.data.user,
          token: res.data.token,
        })
      );
      toast.success('Account verified!');
      router.replace('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await authService.signupResendOtp(form.email);
      toast.success('Code resent');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Could not resend code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <AuthFormLayout
        title="Verify email"
        subtitle={`Enter the 6-digit code sent to ${form.email}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="text-brand-orange font-semibold hover:underline mr-2"
            >
              ← Back
            </button>
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleVerify} className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="ui-btn-primary w-full py-3"
          >
            {loading ? 'Verifying…' : 'Verify & create account'}
          </button>
          <p className="text-center text-sm text-brand-muted">
            Didn&apos;t get the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-brand-orange font-semibold hover:underline disabled:opacity-50"
            >
              Resend
            </button>
          </p>
        </form>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Create account"
      subtitle="We will send a verification code to your email"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-brand-orange font-semibold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Full name *
          </label>
          <input
            className="ui-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your Name"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Email *
          </label>
          <input
            type="email"
            className="ui-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="teacher@school.edu"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            School (optional)
          </label>
          <input
            className="ui-input"
            value={form.schoolName}
            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            placeholder="Your school name"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Password * (min 6 characters)
          </label>
          <input
            type="password"
            className="ui-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full py-3 mt-2"
        >
          {loading ? 'Sending code…' : 'Continue'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
