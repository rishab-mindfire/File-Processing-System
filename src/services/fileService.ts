import type { FileItem } from '../models/Types';

export const fileService = {
  async uploadFiles(files: File[]): Promise<FileItem[]> {
    await setTimeout(() => {}, 1500); // Simulate upload time

    //create file and return
    return files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
  },
};
