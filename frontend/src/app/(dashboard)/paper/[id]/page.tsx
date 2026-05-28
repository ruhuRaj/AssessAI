'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setPaper, regeneratePaper } from '@/store/generationSlice';
import { QuestionPaperDisplay } from '@/components/QuestionPaperDisplay';
import { TopBar } from '@/components/layout/TopBar';
import { WorkflowStepper } from '@/components/WorkflowStepper';
import { generationService, assignmentService } from '@/services/api';
import { Assignment } from '@/types';
import toast from 'react-hot-toast';

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { paper } = useSelector((state: RootState) => state.generation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const assignmentId = params.id as string;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [paperRes, assignRes] = await Promise.all([
          generationService.getPaper(assignmentId),
          assignmentService.get(assignmentId),
        ]);
        dispatch(setPaper(paperRes.data));
        setAssignment(assignRes.data);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } } };
        setError(e.response?.data?.error || 'Failed to load');
        toast.error('Failed to load paper');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      if (!paper || paper.assignmentId !== assignmentId) load();
      else {
        assignmentService.get(assignmentId).then((r) => setAssignment(r.data));
        setLoading(false);
      }
    }
  }, [assignmentId, dispatch, paper]);

  const handleRegenerate = () => {
    dispatch(regeneratePaper());
    router.push(`/generate/${assignmentId}?regenerate=true`);
  };

  return (
    <>
      <TopBar title="Question paper" showBack backHref="/assignments" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-brand-surface">
        <WorkflowStepper current="view" className="mb-8 max-w-2xl" />

        {loading && (
          <div className="py-24 text-center">
            <div className="animate-spin w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full mx-auto" />
            <p className="text-brand-muted mt-4">Loading paper…</p>
          </div>
        )}

        {error && !loading && (
          <div className="ui-card max-w-lg mx-auto p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              className="ui-btn-primary"
              onClick={() => router.push(`/generate/${assignmentId}`)}
            >
              Generate paper
            </button>
          </div>
        )}

        {!loading && !error && paper && (
          <QuestionPaperDisplay
            paper={paper}
            assignment={assignment}
            onRegenerate={handleRegenerate}
          />
        )}

        {!loading && !error && !paper && (
          <div className="ui-card max-w-lg mx-auto p-8 text-center">
            <p className="text-brand-muted mb-4">No paper generated yet.</p>
            <button
              type="button"
              className="ui-btn-primary"
              onClick={() => router.push(`/generate/${assignmentId}`)}
            >
              Generate now
            </button>
          </div>
        )}
      </main>
    </>
  );
}
