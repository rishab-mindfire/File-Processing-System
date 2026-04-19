import { getErrorMessage } from '../hooks/customeHooks';
import type { ZipItem, ZipJobResponse, ZipStatusResponse } from '../models/Types';
import { api } from './apiInterceptor';

/**
 * ZipService
 *
 * Handles ZIP job lifecycle:
 * - Create job
 * - Poll status
 * - Fetch history
 * - Download zip
 * - Delete zip
 */
export const zipService = {
  /**
   * Create a new ZIP job
   */
  async createZip(projectId: string, fileIds: string[]): Promise<ZipJobResponse> {
    try {
      const res = await api.post<ZipJobResponse>(`/projects/${projectId}/jobs/zip`, { fileIds });
      return res.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  /**
   * Get job status (used for polling)
   */
  async getStatus(projectId: string, jobId: string): Promise<ZipStatusResponse> {
    try {
      const res = await api.get<ZipStatusResponse>(`/projects/${projectId}/jobs/${jobId}`);
      return res.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  /**
   * Get completed ZIP history
   */
  async getZipList(projectId: string): Promise<ZipItem[]> {
    try {
      const res = await api.get<ZipItem[]>(`/projects/${projectId}/zip`);
      return res.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  /**
   * Download ZIP file as blob
   */
  async downloadZip(projectId: string, jobId: string): Promise<Blob> {
    try {
      const res = await api.get(`/projects/${projectId}/jobs/${jobId}/download`, {
        responseType: 'blob',
      });

      return res.data;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },

  /**
   * Delete ZIP job
   */
  async deleteZip(projectId: string, jobId: string): Promise<string> {
    try {
      const res = await api.delete(`/projects/${projectId}/jobs/${jobId}`);
      if (res.status === 200) {
        return res.data?.message || 'Deleted successfully';
      } else {
        return res.data?.message || 'Delete fail';
      }
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  },
};
