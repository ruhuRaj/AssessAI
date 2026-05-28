'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  setProgress,
  setPaper,
  setGenerationError,
} from '@/store/generationSlice';
import { useWebSocket } from '@/hooks/useWebSocket';
import { generationService } from '@/services/api';
import toast from 'react-hot-toast';

interface GenerationProgressProps {
  jobId: string;
  assignmentId: string;
  onComplete?: () => void;
}

export function GenerationProgress({
  jobId,
  assignmentId,
  onComplete,
}: GenerationProgressProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { progress, isGenerating } = useSelector(
    (state: RootState) => state.generation
  );
  const [statusMessage, setStatusMessage] = useState('Connecting...');

  const handleWebSocketMessage = useCallback(
    async (data: {
      jobId?: string;
      state?: string;
      progress?: number;
      returnValue?: { assignmentId?: string };
      assignmentId?: string;
    }) => {
      if (data.jobId !== undefined && String(data.jobId) !== String(jobId)) {
        return;
      }

      if (data.progress !== undefined) {
        dispatch(setProgress(data.progress || 0));
      }

      if (data.state === 'completed') {
        dispatch(setProgress(100));
        setStatusMessage('Building structured paper...');
        try {
          const id =
            data.returnValue?.assignmentId ||
            data.assignmentId ||
            assignmentId;
          const response = await generationService.getPaper(id);
          dispatch(setPaper(response.data));
          toast.success('Question paper ready!');
          onComplete?.();
        } catch {
          toast.error('Failed to fetch paper');
          dispatch(setGenerationError('Failed to fetch paper'));
        }
        return;
      }

      if (data.state === 'failed') {
        setStatusMessage('Generation failed');
        dispatch(setGenerationError('Failed'));
        toast.error('Generation failed');
        return;
      }

      if (data.state === 'active') {
        setStatusMessage('AI is writing questions...');
      }
    },
    [jobId, assignmentId, dispatch, onComplete]
  );

  const { subscribe } = useWebSocket(handleWebSocketMessage, () => {
    toast.error('WebSocket error');
  });

  useEffect(() => {
    subscribe(jobId);
  }, [jobId, subscribe]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Generating paper</h3>
        <span className="text-2xl font-bold text-brand-orange">{progress}%</span>
      </div>
      <div className="h-2 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-dark transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-brand-muted">{statusMessage}</p>
      {isGenerating && progress < 100 && (
        <div className="flex justify-center">
          <div className="animate-spin w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
