export interface Job {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  progress: number;
  fileName: string;
}

export type JobState = { jobs: Job[] };

export type JobAction =
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'COMPLETE_JOB'; payload: string };

export const initialJobState: JobState = { jobs: [] };

export function jobReducer(state: JobState, action: JobAction): JobState {
  switch (action.type) {
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.payload.id
            ? { ...j, progress: action.payload.progress, status: 'PROCESSING' }
            : j,
        ),
      };
    case 'COMPLETE_JOB':
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.payload
            ? { ...j, status: 'COMPLETED', progress: 100 }
            : j,
        ),
      };
    default:
      return state;
  }
}
