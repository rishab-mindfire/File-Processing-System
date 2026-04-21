import type { Project } from '../src/models/Types';

export const MOCK_PROJECTS: Project[] = [
  {
    _id: '1',
    projectName: 'Project 1',
    projectDescription: 'Main production website assets files.',
    totalFiles: 5,
    totalZips: 1,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    _id: '2',
    projectName: 'Project 2',
    projectDescription: 'Backend documentation and files.',
    totalFiles: 2,
    totalZips: 0,
    createdAt: new Date().toISOString().split('T')[0],
  },
];
