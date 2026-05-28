'use client';

import { useEffect, useState } from 'react';
import { getMediaUrl } from '@/services/api';
import clsx from 'clsx';

interface UserAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-24 h-24 text-2xl',
};

export function UserAvatar({
  name = 'U',
  imageUrl,
  size = 'sm',
  className,
}: UserAvatarProps) {
  const src = getMediaUrl(imageUrl);
  const initial = (name?.trim()?.[0] || 'U').toUpperCase();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        key={src}
        onError={() => setFailed(true)}
        className={clsx(
          'rounded-full object-cover shrink-0 bg-brand-surface',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center font-bold text-brand-dark shrink-0',
        sizes[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
