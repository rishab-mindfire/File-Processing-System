import type { FileItem } from '../models/Types';

export const FileUploadService = {
  upload: (
    projectId: string,
    files: File[],
    onProgress: (percent: number) => void,
    onSuccess: (data: FileItem[]) => void,
    onError: (err: string, mockRecoveredFiles?: FileItem[]) => void,
  ) => {
    //API call can be here or processs mock as of now

    let progress = 0;
    // Progress updates
    const progressInterval = setInterval(() => {
      progress += 20;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 500);
    setTimeout(() => {
      // Success path mock data add
      const successFiles: FileItem[] = files.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        uploadedAt: new Date().toISOString(),
        projectId: projectId,
        url: '',
      }));
      onSuccess(successFiles);
    }, 5000);
  },
};
