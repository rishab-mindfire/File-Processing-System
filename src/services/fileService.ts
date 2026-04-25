import type { FileItem } from '../models/Types';
import { api } from './apiInterceptor';
import { getErrorMessage } from '../hooks/customHooks';

/**
 * FileService
 *
 * Handles all file-related API operations:
 * - Upload
 * - List
 * - Delete
 * - Download
 */
export const FileService = {
  // Upload multiple files with progress tracking
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
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  // Get all files for a project
  listFile: async (projectId: string): Promise<FileItem[]> => {
    try {
      const res = await api.get(`/projects/${projectId}/files`);
      return res.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  // Delete a file by ID
  deleteFile: async (projectId: string, fieldId: string): Promise<string | undefined> => {
    try {
      const res = await api.delete(`/projects/${projectId}/files/${fieldId}`);

      return res.data?.message || 'File deleted';
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  // Download file as blob
  downloadFile: async (projectId: string, fieldId: string): Promise<Blob | undefined> => {
    try {
      const res = await api.get(`/projects/${projectId}/files/${fieldId}/download`, {
        responseType: 'blob',
      });

      return res.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },
};
