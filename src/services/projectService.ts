import { getErrorMessage } from '../hooks/customeHooks';
import type { CreateNewProject, Project } from '../models/Types';
import { api } from './apiInterceptor';

/**
 * projectService
 *
 * Handles all project-related API operations
 */
export const projectService = {
  // Fetch all projects
  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Create a new project
  async createProject(payload: CreateNewProject): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', payload);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get project by ID
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Delete project by ID
  async deleteProject(id: string): Promise<string> {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data?.message || 'Project deleted successfully';
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },
};
