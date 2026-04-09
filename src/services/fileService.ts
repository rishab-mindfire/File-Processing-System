export interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export const fileService = {
  async uploadFiles(projectId: string, files: File[]): Promise<FileItem[]> {
    await setTimeout(() => {}, 1500); // Simulate upload time

    // Transform browser File objects into our UI FileItem format
    return files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
  },
};
