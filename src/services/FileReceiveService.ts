import type { FileItem } from '../models/Types';

export const FileReceiveService = {
  list: async (projectId: string): Promise<FileItem[]> => {
    //API can be called here for list all files
    // url - /api/projects/${projectId}/files;

    return [
      {
        projectId: projectId,
        id: '1111',
        name: 'fake file 1',
        size: 3434,
        uploadedAt: '3032',
        url: 'www.google.com',
      },
      {
        projectId: projectId,
        id: '2222',
        name: 'fake file 2',
        size: 3432214,
        uploadedAt: '3032',
        url: 'www.google.com',
      },
      {
        projectId: projectId,
        id: '3333',
        name: 'fake file 3',
        size: 8928397,
        uploadedAt: '3032',
        url: 'www.google.com',
      },
      {
        projectId: projectId,
        id: '444',
        name: 'fake file 4',
        size: 8767,
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
