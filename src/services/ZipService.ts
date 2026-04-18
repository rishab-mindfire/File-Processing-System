import { api } from './apiInterceptor';

export const ZipService = {
  async createZip(projectId: string, fileIds: string[]) {
    const res = await api.post(`/projects/${projectId}/jobs/zip`, { fileIds });
    return res.data;
  },

  async getStatus(projectId: string, jobId: string) {
    const res = await api.get(`/projects/${projectId}/jobs/${jobId}`);
    return res.data;
  },

  async getZipList(projectId: string) {
    const res = await api.get(`/projects/${projectId}/zip`);
    return res;
  },

  async downloadZip(projectId: string, jobId: string) {
    const res = await api.get(`/projects/${projectId}/jobs/${jobId}/download`, {
      responseType: 'blob',
    });
    return res;
  },
};
