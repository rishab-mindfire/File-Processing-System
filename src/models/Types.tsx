// auth context
export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};
export type AuthContextType = {
  state: AuthState;
  login: (token: string) => void;
  logout: () => void;
};

// login
export type LoginAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Errors }
  | { type: 'RESET' };
export interface Errors {
  email?: string;
  password?: string;
  general?: string;
}
export interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  errors: Errors;
}

// project management
export interface Project {
  id: string;
  name: string;
  description: string;
  filesCount: number;
  jobsCount: number;
  createdAt: string;
}
export type ProjectState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

export type ProjectAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Project[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string };

// file management
export interface FileItem {
  projectId?: string;
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

// zip job management
export interface Job {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  fileName: string;
}
export interface FileSectionProps {
  projectId: string;
  onStartZip: (selectedIds: string[]) => void;
}
export type JobState = { jobs: Job[] };
export type JobAction =
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'COMPLETE_JOB'; payload: string }
  | { type: 'FAIL_JOB'; payload: string };
