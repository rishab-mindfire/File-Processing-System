import type { FileItem } from '../models/Types';

export const FileUploadService = {
  upload: (
    projectId: string,
    files: File[],
    onProgress: (percent: number) => void,
    onSuccess: (data: FileItem[]) => void,
    onError: (err: string, mockRecoveredFiles?: FileItem[]) => void,
  ) => {
    let progress = 0;

    // Progress updates
    const progressInterval = setInterval(() => {
      progress += 20;
      onProgress(progress);
      if (progress >= 100) clearInterval(progressInterval);
    }, 500);

    //API call can be here or processs mock as of now
    // Simulate Network Request
    setTimeout(() => {
      // MOCK test
      const isNetworkFailure = Math.random() > 0.5;

      if (isNetworkFailure) {
        // Create files to server
        const recoveredFiles: FileItem[] = files.map((f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          size: f.size,
          uploadedAt: new Date().toISOString(),
        }));

        onError(
          'Network Error: Packet loss detected. Retrying...',
          recoveredFiles,
        );
      } else {
        // Success path
        const successFiles: FileItem[] = files.map((f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          size: f.size,
          uploadedAt: new Date().toISOString(),
          projectId: projectId,
        }));
        onSuccess(successFiles);
      }
    }, 5000);
  },
};
