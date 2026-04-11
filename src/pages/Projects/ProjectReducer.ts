import type { Project, ProjectAction, ProjectState } from '../../models/Types';

// ProjectList dummy list
export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Project 1',
    description: 'Main production website assets files.',
    filesCount: 5,
    jobsCount: 1,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    name: 'Project 2',
    description: 'Backend documentation and files.',
    filesCount: 2,
    jobsCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const initialState: ProjectState = {
  projects: MOCK_PROJECTS,
  loading: false,
  error: null,
};
// project reducer
export function projectReducer(
  state: ProjectState,
  action: ProjectAction,
): ProjectState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, projects: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };
    default:
      return state;
  }
}
