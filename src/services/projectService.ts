import axios, { type AxiosResponse } from 'axios';
import type { CreateNewProject, Project } from '../models/Types';
import { api } from './apiInterceptor';

export const projectService = {
  // Project list :
  async getAllProjects(): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await api.get('/projects');
    return response.data;
  },
  // create project :
  async createProject(payload: CreateNewProject): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', payload);
      return response.data;
    } catch (error: unknown) {
      let message = 'Failed to create project';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          message = error?.response?.data?.error;
        }
      }
      throw new Error(message);
    }
  },
  // Get project by ID
  async getProjectById(id: string): Promise<Project> {
    const response: AxiosResponse<Project> = await api.get(`/projects/${id}`);
    return response.data;
  },
  // delete Project
  async deleteProject(id: string): Promise<string> {
    // Axios will throw an error automatically if status is not 2xx
    const response = await api.delete(`/projects/${id}`);

    // Return the success message from the backend
    return response.data.message || 'Project deleted successfully';
  },
};
