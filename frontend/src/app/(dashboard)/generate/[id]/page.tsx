import { Suspense } from 'react';
import GeneratePageContent from './GeneratePageContent';

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-brand-muted">Loading...</div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}
