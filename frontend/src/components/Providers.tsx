'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { ExtensionErrorFilter } from '@/components/ExtensionErrorFilter';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ExtensionErrorFilter />
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
