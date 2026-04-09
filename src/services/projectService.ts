import type { Project } from '../models/Types';
import { MOCK_PROJECTS } from '../pages/Projects/ProjectReducer';

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const projectService = {
  /**
   * TASK 2: Project CRUD
   */
  async getAllProjects(): Promise<Project[]> {
    await delay(800); // Simulate API call
    return [...MOCK_PROJECTS];
  },

  async createProject(name: string, description: string): Promise<Project> {
    await delay(1000);
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      filesCount: 0,
      jobsCount: 0,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * TASK 3: File Management (Requirement: Manual FormData usage)
   */
  async uploadFiles(
    projectId: string,
    files: File[],
    onProgress: (percent: number) => void,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      // Requirement 3: Manual FormData usage
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      // Requirement 5: Manual progress tracking via XMLHttpRequest
      const xhr = new XMLHttpRequest();

      // Target URL (Hardcoded for now)
      xhr.open('POST', `/api/projects/${projectId}/files`);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response || '{}'));
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network failure'));

      // Simulate sending for static testing
      // In a real scenario, you'd call: xhr.send(formData);

      // FOR STATIC TEST: We simulate the completion since there's no real backend
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress += 10;
        onProgress(fakeProgress);
        if (fakeProgress >= 100) {
          clearInterval(interval);
          resolve({ success: true });
        }
      }, 100);
    });
  },
};
