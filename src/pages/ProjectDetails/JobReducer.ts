import type { JobAction, JobState } from '../../models/Types';

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
