import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProjectList from './ProjectList';
import { projectService } from '../../services/projectService';
import '@testing-library/jest-dom';
import { MOCK_PROJECTS } from '../../../test/testMock';

vi.mock('../../services/projectService', () => ({
  projectService: {
    getAllProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProjectList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectService.getAllProjects).mockResolvedValue(MOCK_PROJECTS);
  });

  it('should render the loader initially and then the project list', async () => {
    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(await screen.findByText('Project 1')).toBeInTheDocument();
  });

  it('should open the "Create" modal and add a new project locally', async () => {
    const user = userEvent.setup();
    const newProjectMock = {
      _id: '3',
      projectName: 'New Test Project',
      projectDescription: 'A description',
      createdAt: new Date().toISOString(),
      totalFiles: 0,
      totalZips: 0,
    };

    vi.mocked(projectService.createProject).mockResolvedValue(newProjectMock);

    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    await user.click(await screen.findByText(/\+ new project/i));

    // This will now work because of the ID/htmlFor fix in the component
    const nameInput = screen.getByLabelText(/project name/i);
    await user.type(nameInput, 'New Test Project');

    await user.click(screen.getByRole('button', { name: /create project/i }));

    expect(await screen.findByText('New Test Project')).toBeInTheDocument();
  });

  it('should open delete confirmation and remove project from list', async () => {
    const user = userEvent.setup();
    vi.mocked(projectService.deleteProject).mockResolvedValue('1');
    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    const deleteButtons = await screen.findAllByLabelText(/delete project/i);
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
    });
  });

  it('should show error message if API fails', async () => {
    // Force the mock to fail
    vi.mocked(projectService.getAllProjects).mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    //  findByText if project not found on error of fails API
    const errorMsg = await screen.findByText(/No projects found./i);
    expect(errorMsg).toBeInTheDocument();
  });
});
