import { delay } from '../hooks/customeHooks';
import type { Project } from '../models/Types';

// ProjectList dummy list
export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Project 1',
    description: 'Main production website assets files.',
    filesCount: 5,
    jobsCount: 1,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    name: 'Project 2',
    description: 'Backend documentation and files.',
    filesCount: 2,
    jobsCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const projectService = {
  // Project list :
  async getAllProjects(): Promise<Project[]> {
    // API can Be called here
    await delay(2000);
    // throw new Error('Failed to fetch projects network err');
    return [...MOCK_PROJECTS];
  },
  // create project :
  async createProject(name: string, description: string): Promise<Project> {
    await delay(1000);
    // API will be called here
    return {
      id: Math.random().toString(36),
      name,
      description,
      filesCount: 0,
      jobsCount: 0,
      createdAt: new Date().toISOString(),
    };
  },
};
