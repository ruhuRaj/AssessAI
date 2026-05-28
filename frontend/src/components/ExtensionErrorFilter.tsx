'use client';

import { useEffect } from 'react';

/** Errors from wallet extensions (MetaMask, etc.) — not from this app */
function isWalletExtensionError(reason: unknown): boolean {
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === 'string'
        ? reason
        : '';

  return /metamask|failed to connect to metamask|walletconnect|ethereum provider/i.test(
    message
  );
}

function isExtensionScript(filename?: string): boolean {
  return !!filename?.startsWith('chrome-extension://');
}

/**
 * MetaMask and similar extensions inject scripts into every tab.
 * When they fail to connect, Next.js dev overlay treats it as an app crash.
 * This component ignores those external errors only.
 */
export function ExtensionErrorFilter() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isWalletExtensionError(event.reason)) {
        event.preventDefault();
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[AssessAI] Ignored wallet extension error (not from this app):',
            event.reason
          );
        }
      }
    };

    const onError = (event: ErrorEvent) => {
      if (
        isExtensionScript(event.filename) ||
        isWalletExtensionError(event.message) ||
        isWalletExtensionError(event.error)
      ) {
        event.preventDefault();
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[AssessAI] Ignored wallet extension error (not from this app):',
            event.message
          );
        }
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  return null;
}
