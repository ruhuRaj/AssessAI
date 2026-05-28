'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { WorkflowStepper } from '@/components/WorkflowStepper';
import { AssignmentForm } from '@/components/AssignmentForm';
import { Assignment } from '@/types';
import { assignmentService } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import {
  setCurrentAssignment,
  setAssignmentLoading,
  setAssignmentError,
} from '@/store/assignmentSlice';
import toast from 'react-hot-toast';

export default function CreateAssignmentPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (assignment: Assignment, file: File | null) => {
    try {
      setLoading(true);
      dispatch(setAssignmentLoading(true));
      const response = await assignmentService.create(assignment, file);
      const created = response.data.assignment;
      dispatch(setCurrentAssignment(created));
      toast.success('Assignment created — ready to generate');
      router.push(`/generate/${created._id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const msg = err.response?.data?.error || 'Failed to create assignment';
      dispatch(setAssignmentError(msg));
      toast.error(msg);
    } finally {
      setLoading(false);
      dispatch(setAssignmentLoading(false));
    }
  };

  return (
    <>
      <TopBar title="Assignment" showBack backHref="/assignments" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-brand-surface">
        <WorkflowStepper current="create" className="mb-8 max-w-2xl" />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">
            Create assignment
          </h1>
          <p className="text-brand-muted mt-1 max-w-xl">
            Define marks, question types, and optional reference material. AI
            will turn this into a structured exam paper — never unformatted text.
          </p>
        </div>

        <AssignmentForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => router.push('/')}
        />
      </main>
    </>
  );
}
