// login
export type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Errors }
  | { type: 'RESET' };

export interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

export interface State {
  email: string;
  password: string;
  loading: boolean;
  errors: Errors;
}
// project
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

// file
export interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}
// job
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
