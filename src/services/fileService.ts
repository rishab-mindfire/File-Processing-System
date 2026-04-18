import type { FileItem } from '../models/Types';
import { api } from './apiInterceptor';

export const FileService = {
  uploadFile: async (
    projectId: string,
    files: File[],
    onProgress: (percent: number) => void,
  ): Promise<FileItem[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const res = await api.post(`/projects/${projectId}/files`, formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      if (!Array.isArray(res.data?.data)) {
        throw new Error('Invalid response from server');
      }

      return res.data.data;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Upload failed');
    }
  },
  listFile: async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}/files`);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log('error in list', error);
    }
  },
  deleteFile: async (projectId: string, fieldId: string) => {
    try {
      const response = await api.delete(`/projects/${projectId}/files/${fieldId}`);
      if (response.status === 200) {
        return response.data.message;
      }
    } catch (error) {
      console.log('error in delete', error);
    }
  },
  downloaFile: async (projectId: string, fieldId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}/files/${fieldId}/download`, {
        responseType: 'blob',
      });

      return response;
    } catch (error) {
      if (error) {
        throw error;
      }
    }
  },
};
