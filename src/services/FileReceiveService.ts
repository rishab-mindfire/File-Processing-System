import type { FileItem } from '../models/Types';

export const FileReceiveService = {
  // List Files (Requirement: Fetch data for display)
  list: async (projectId: string): Promise<FileItem[]> => {
    const response = await fetch(`/api/projects/${projectId}/files`);
    if (!response.ok) throw new Error('Failed to fetch file list.');
    return response.json();
  },

  // Delete File (Requirement: Must update UI immediately after)
  delete: async (projectId: string, fileId: string): Promise<void> => {
    const response = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete operation failed.');
  },
};
