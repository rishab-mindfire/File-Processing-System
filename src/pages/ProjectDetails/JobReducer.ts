import type { JobAction, JobState } from '../../models/Types';

export const initialJobState: JobState = { jobs: [] };

export function jobReducer(state: JobState, action: JobAction): JobState {
  switch (action.type) {
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.id
            ? {
                ...job,
                progress: action.payload.progress,
                status: 'PROCESSING',
              }
            : job,
        ),
      };
    case 'COMPLETE_JOB':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload
            ? { ...job, status: 'COMPLETED', progress: 100 }
            : job,
        ),
      };
    default:
      return state;
  }
}
