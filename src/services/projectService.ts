import { delay } from '../hooks/customeHooks';
import type { Project } from '../models/Types';
import { MOCK_PROJECTS } from '../reducers/ProjectReducer';

export const projectService = {
  // Project list :
  async getAllProjects(): Promise<Project[]> {
    // API can Be called here
    await delay(800);
    return [...MOCK_PROJECTS];
  },
  // create project :
  async createProject(name: string, description: string): Promise<Project> {
    await delay(1000);
    // API will be called here
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      filesCount: 0,
      jobsCount: 0,
      createdAt: new Date().toISOString(),
    };
  },
};
