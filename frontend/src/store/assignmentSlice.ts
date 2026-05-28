import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Assignment } from '@/types/index';

export const defaultFormDraft: Assignment = {
  title: '',
  description: '',
  subject: '',
  totalMarks: 0,
  numberOfQuestions: 0,
  questionTypes: [],
  difficulty: 'mixed',
  dueDate: '',
  additionalInstructions: '',
};

interface AssignmentState {
  current: Assignment | null;
  formDraft: Assignment;
  list: Assignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  current: null,
  formDraft: { ...defaultFormDraft },
  list: [],
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setAssignmentLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCurrentAssignment: (state, action: PayloadAction<Assignment>) => {
      state.current = action.payload;
      state.error = null;
    },
    setAssignmentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetCurrentAssignment: (state) => {
      state.current = null;
      state.error = null;
    },
    setFormField: (
      state,
      action: PayloadAction<{ field: keyof Assignment; value: unknown }>
    ) => {
      (state.formDraft as Record<string, unknown>)[action.payload.field] =
        action.payload.value;
    },
    setFormDraft: (state, action: PayloadAction<Partial<Assignment>>) => {
      state.formDraft = { ...state.formDraft, ...action.payload };
    },
    resetFormDraft: (state) => {
      state.formDraft = { ...defaultFormDraft };
    },
    setAssignmentList: (
      state,
      action: PayloadAction<(Assignment & { hasPaper?: boolean })[]>
    ) => {
      state.list = action.payload;
    },
    updateAssignmentField: (
      state,
      action: PayloadAction<{ field: keyof Assignment; value: unknown }>
    ) => {
      if (state.current) {
        (state.current as Record<string, unknown>)[action.payload.field] =
          action.payload.value;
      }
    },
  },
});

export const {
  setAssignmentLoading,
  setCurrentAssignment,
  setAssignmentError,
  resetCurrentAssignment,
  updateAssignmentField,
  setFormField,
  setFormDraft,
  resetFormDraft,
  setAssignmentList,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;
