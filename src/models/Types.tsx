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
  userEmail?: string;
  userPassword?: string;
  general?: string;
}
export interface LoginState {
  userEmail: string;
  userPassword: string;
  loading: boolean;
  errors: Errors;
}

export type LoginResponse = {
  token: string;
};

// project management
export interface Project {
  _id: string;
  projectName: string;
  description: string;
  totalFiles: number;
  totalZips: number;
  createdAt: string;
}
// create new Project
export interface CreateNewProject {
  projectName: string;
  projectDescription?: string;
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
  _id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

// zip job management
export interface Job {
  jobId: string;
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
  | { type: 'UPDATE_PROGRESS'; payload: { _id: string; progress: number } }
  | { type: 'COMPLETE_JOB'; payload: string }
  | { type: 'FAIL_JOB'; payload: string };
