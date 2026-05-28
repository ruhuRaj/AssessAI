import Link from 'next/link';
import { LogoIcon } from '@/components/icons';
import { BRAND_NAME } from '@/constants/brand';

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthFormLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthFormLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <LogoIcon className="w-10 h-10" />
          <span className="text-2xl font-bold text-brand-dark">{BRAND_NAME}</span>
        </div>

        <div className="ui-card p-8">
          <h1 className="text-2xl font-bold text-brand-dark text-center">
            {title}
          </h1>
          <p className="text-brand-muted text-center text-sm mt-2 mb-8">
            {subtitle}
          </p>
          {children}
        </div>

        <p className="text-center text-sm text-brand-muted mt-6">{footer}</p>
      </div>
    </div>
  );
}
