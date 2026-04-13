import type { FileItem } from '../models/Types';

export const FileReceiveService = {
  list: async (projectId: string): Promise<FileItem[]> => {
    //API can be called here for list all files
    // url - /api/projects/${projectId}/files;

    return [
      {
        projectId: projectId,
        id: '13232',
        name: 'fack file',
        size: 3434,
        uploadedAt: '3032',
        url: 'www.google.com',
      },
    ];
  },

  // delete file
  delete: async (projectId: string, fileId: string): Promise<void> => {
    //url: `/api/projects/${projectId}/files/${fileId}`
    console.log({ projectId: projectId, fileId: fileId });
  },
};
