import type { FileItem } from '../models/Types';

export const FileReceiveService = {
  list: async (projectId: string): Promise<FileItem[]> => {
    //API can be called here for list all files
    const response = await fetch(`/api/projects/${projectId}/files`);

    if (!response.ok) throw new Error('Failed to fetch file list.');
    return [
      {
        id: '13232',
        name: 'fack file',
        size: 3434,
        uploadedAt: '3032',
      },
    ];
  },

  // delete file
  delete: async (projectId: string, fileId: string): Promise<void> => {
    const response = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete operation failed.');
  },
};
