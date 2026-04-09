export interface Project {
  id: string;
  name: string;
  description: string;
  filesCount: number;
  jobsCount: number;
  createdAt: string;
}

// ProjectList dummy list
export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Main production website assets.',
    filesCount: 5,
    jobsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile App API',
    description: 'Backend documentation and files.',
    filesCount: 2,
    jobsCount: 0,
    createdAt: new Date().toISOString(),
  },
];

export type ProjectState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};
// Project Actions
export type ProjectAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Project[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string };

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
