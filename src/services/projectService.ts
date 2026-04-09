import { delay } from '../hooks/customeHooks';
import type { Project } from '../models/Types';
import { MOCK_PROJECTS } from '../pages/Projects/ProjectReducer';

export const projectService = {
  // Project list :
  async getAllProjects(): Promise<Project[]> {
    await delay(800);
    return [...MOCK_PROJECTS];
  },
  // create project :
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

  // File Management (upload)
  async uploadFiles(
    projectId: string,
    files: File[],
    onProgress: (percent: number) => void,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      // Manual FormData usage
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      // Manual progress tracking via XMLHttpRequest
      const xhr = new XMLHttpRequest();

      // Target URL
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

      // Sending data for static testing
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
