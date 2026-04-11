import { delay } from '../hooks/customeHooks';
import type { Project } from '../models/Types';
import { MOCK_PROJECTS } from '../pages/Projects/ProjectReducer';

export const projectService = {
  // Project list :
  async getAllProjects(): Promise<Project[]> {
    // API can Be called here
    await delay(800);
    return [...MOCK_PROJECTS];
  },
  // create project :
  async createProject(name: string, description: string): Promise<Project> {
    await delay(1000);
    // API will be called here
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      filesCount: 0,
      jobsCount: 0,
      createdAt: new Date().toISOString(),
    };
  },
};

// File Management (upload)
//   async uploadFiles(
//     files: File[],
//     onProgress: (percent: number) => void,
//   ): Promise<unknown> {
//     return new Promise((resolve) => {
//       // Manual FormData usage
//       const formData = new FormData();
//       files.forEach((file) => formData.append('files', file));
//       //API

//       // Sending data for static testing mock data
//       let fakeProgress = 0;
//       const interval = setInterval(() => {
//         fakeProgress += 10;
//         onProgress(fakeProgress);
//         if (fakeProgress >= 100) {
//           clearInterval(interval);
//           resolve({ success: true });
//         }
//       }, 100);
//     });
//   },
// };

// export const fileUploadService = {
//   uploadFiles: async (
//     projectId: string,
//     formData: FormData,
//   ): Promise<FileItem[]> => {
//     console.log(projectId);
//     return new Promise((resolve) => {
//       const uploadedFiles: FileItem[] = [];
//       //API call will be here for file uplaod to server

//       formData.forEach((value) => {
//         const file = value as File;
//         uploadedFiles.push({
//           id: crypto.randomUUID(),
//           name: file.name,
//           size: file.size,
//           uploadedAt: new Date().toISOString(),
//           url: '',
//         });
//       });

//       resolve(uploadedFiles);
//     });
//   },
// };
