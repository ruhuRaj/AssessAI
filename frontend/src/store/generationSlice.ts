import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GenerationJob, QuestionPaper, Section } from '@/types/index';

interface GenerationState {
  currentJob: GenerationJob | null;
  paper: QuestionPaper | null;
  loading: boolean;
  error: string | null;
  progress: number;
  isGenerating: boolean;
}

const initialState: GenerationState = {
  currentJob: null,
  paper: null,
  loading: false,
  error: null,
  progress: 0,
  isGenerating: false,
};

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setCurrentJob: (state, action: PayloadAction<GenerationJob>) => {
      state.currentJob = action.payload;
      state.error = null;
    },
    setPaper: (state, action: PayloadAction<QuestionPaper>) => {
      state.paper = action.payload;
      state.isGenerating = false;
      state.progress = 100;
    },
    setGenerationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isGenerating = false;
    },
    resetGeneration: (state) => {
      state.currentJob = null;
      state.paper = null;
      state.progress = 0;
      state.error = null;
      state.isGenerating = false;
    },
    regeneratePaper: (state) => {
      state.currentJob = null;
      state.paper = null;
      state.isGenerating = false;
      state.progress = 0;
      state.error = null;
    },
  },
});

export const {
  setGenerating,
  setProgress,
  setCurrentJob,
  setPaper,
  setGenerationError,
  resetGeneration,
  regeneratePaper,
} = generationSlice.actions;

export default generationSlice.reducer;
