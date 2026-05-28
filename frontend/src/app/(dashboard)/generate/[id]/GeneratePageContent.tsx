'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  setGenerating,
  setCurrentJob,
  setGenerationError,
  setPaper,
} from '@/store/generationSlice';
import { GenerationProgress } from '@/components/GenerationProgress';
import { TopBar } from '@/components/layout/TopBar';
import { WorkflowStepper } from '@/components/WorkflowStepper';
import { assignmentService } from '@/services/api';
import { Assignment } from '@/types';
import toast from 'react-hot-toast';

const GENERATION_STEPS = [
  'Building a structured prompt from your assignment',
  'Queueing a background job (BullMQ + Redis)',
  'Calling the AI and parsing JSON into sections',
  'Saving to MongoDB and notifying via WebSocket',
];

export default function GeneratePageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentJob, isGenerating } = useSelector(
    (state: RootState) => state.generation
  );
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const assignmentId = params.id as string;
  const isRegenerate = searchParams.get('regenerate') === 'true';

  useEffect(() => {
    if (!assignmentId) {
      router.push('/');
      return;
    }
    assignmentService
      .get(assignmentId)
      .then((res) => setAssignment(res.data))
      .catch(() => toast.error('Could not load assignment'));
  }, [assignmentId, router]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      dispatch(setGenerating(true));
      const response = await assignmentService.generate(assignmentId, {
        force: isRegenerate,
      });

      if (response.data.cached && response.data.paper) {
        dispatch(setPaper(response.data.paper));
        router.push(`/paper/${assignmentId}`);
        return;
      }

      if (response.data.success && response.data.jobId) {
        dispatch(
          setCurrentJob({
            jobId: String(response.data.jobId),
            state: 'active',
            progress: 0,
          })
        );
        toast.success('Generation started');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Generation failed');
      dispatch(setGenerating(false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="Assignment" showBack backHref="/assignments" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-brand-surface">
        <WorkflowStepper current="generate" className="mb-8 max-w-2xl" />

        {!currentJob || !isGenerating ? (
          <div className="max-w-2xl">
            {assignment && (
              <div className="ui-card p-5 mb-6 border-l-4 border-l-brand-orange">
                <p className="text-xs font-bold uppercase text-brand-orange tracking-wide">
                  Ready to generate
                </p>
                <h2 className="text-xl font-bold mt-1">{assignment.title}</h2>
                <p className="text-sm text-brand-muted mt-2">
                  {assignment.subject} · {assignment.numberOfQuestions}{' '}
                  questions · {assignment.totalMarks} marks ·{' '}
                  {assignment.difficulty} difficulty
                </p>
                {assignment.fileName && (
                  <p className="text-xs text-brand-muted mt-2">
                    Reference file: {assignment.fileName}
                  </p>
                )}
              </div>
            )}

            <div className="ui-card p-6 sm:p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">
                {isRegenerate ? 'Regenerate question paper' : 'Generate with AI'}
              </h1>
              <p className="text-brand-muted text-sm mb-6">
                Typically takes 15–60 seconds depending on question count.
              </p>

              <ul className="text-left text-sm text-brand-muted space-y-2 mb-8 max-w-sm mx-auto">
                {GENERATION_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-2">
                    <span className="text-brand-orange font-bold">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="ui-btn-primary px-10 py-3 text-base"
              >
                {loading ? 'Starting…' : 'Start generation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="ui-card max-w-2xl p-8">
            {currentJob && (
              <GenerationProgress
                jobId={currentJob.jobId}
                assignmentId={assignmentId}
                onComplete={() =>
                  setTimeout(() => router.push(`/paper/${assignmentId}`), 600)
                }
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
