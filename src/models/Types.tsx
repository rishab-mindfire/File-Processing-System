// AUTH TYPES
export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};
// Auth context shape used across the app.
export type AuthContextType = {
  state: AuthState;

  /**
   * Logs in the user by storing token
   * @param token - JWT token received from backend
   */
  login: (token: string) => void;

  // Logs out the user and clears session
  logout: () => void;
};

// LOGIN TYPES
// Represents validation errors for login form.
export interface Errors {
  userEmail?: string;
  userPassword?: string;
  general?: string;
}

//suspense
export interface SuspenseProps {
  lines?: number;
  height?: string;
  showAvatar?: boolean;
}

// Login form state.
export interface LoginState {
  userEmail: string;
  userPassword: string;
  loading: boolean;
  errors: Errors;
}

// Actions supported by login reducer.
export type LoginAction =
  | { type: 'SET_FIELD'; field: keyof LoginState; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Errors }
  | { type: 'RESET' };

// Login API response.
export type LoginResponse = {
  token: string;
};

// PROJECT TYPES
// Represents a project entity.
export interface Project {
  _id: string;
  projectName: string;
  projectDescription: string;
  totalFiles: number;
  totalZips: number;
  createdAt: string;
}

// Payload for creating a new project.
export interface CreateNewProject {
  projectName: string;
  projectDescription?: string;
}

// Project state used in reducer.
export type ProjectState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

// Actions for project reducer.
export type ProjectAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Project[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string };

// FILE TYPES
// Represents a file uploaded in a project.
export interface FileItem {
  _id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

// Props for FileSection component.
export interface FileSectionProps {
  projectId: string;

  /**
   * Callback to trigger ZIP creation
   * @param selectedIds - List of selected file IDs
   */
  onStartZip: (selectedIds: string[]) => void;
}

// ZIP JOB TYPES
// Represents a ZIP processing job.
export interface Job {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  fileName: string;
  size?: number;
  completedAt?: string;
}

// Job state for reducer.
export type JobState = {
  jobs: Job[];
};

export interface ZipJobResponse {
  jobId: string;
}

export interface ZipStatusResponse {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  size?: number;
}

export interface ZipItem {
  jobId: string;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  fileName: string;
  size: number;
  completedAt: string;
}

export interface ZipJob {
  jobId: string;
  status: string;
  progress: number;
  fileName: string;
  size: number;
  completedAt: string;
}

// Actions for job reducer.
export type JobAction =
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_PROGRESS'; payload: { jobId: string; progress: number } }
  | { type: 'COMPLETE_JOB'; payload: string }
  | { type: 'FAIL_JOB'; payload: string };

// CUSTOM TYPES
// Extends File type to include folder upload path
export interface WebkitFile extends File {
  webkitRelativePath: string;
}
