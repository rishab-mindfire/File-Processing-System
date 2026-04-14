import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProjectList from './ProjectList';
import { projectService } from '../../services/projectService';
import '@testing-library/jest-dom';
import type { Project } from '../../models/Types';

const MOCK_PROJECTS: Project[] = [
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

// Mock the Service for get all project function called
vi.mock('../../services/projectService', () => ({
  projectService: {
    getAllProjects: vi.fn(),
  },
}));

// Mock useNavigate
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
  //loader test
  it('should render the loader initially and then the project list', async () => {
    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    // Verify Loader is shown
    expect(screen.getByTestId('loader')).toBeInTheDocument();

    // Wait for projects to load
    expect(await screen.findByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });
  //open projects
  it('should navigate to project details when "Open" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    const openButtons = await screen.findAllByText(/open/i);
    await user.click(openButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });
  //create project
  it('should open the "Create" modal and add a new project locally', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    // Open modal
    await user.click(await screen.findByText(/\+ new project/i));
    expect(screen.getByText(/create new project/i)).toBeInTheDocument();

    // Fill form
    const nameInput = screen.getByPlaceholderText(/enter project name/i);
    await user.type(nameInput, 'New Test Project');

    // Submit
    await user.click(screen.getByRole('button', { name: /create project/i }));

    // Verify it appears in the table
    expect(screen.getByText('New Test Project')).toBeInTheDocument();
  });
  //delete project
  it('should open delete confirmation and remove project from list', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );

    // Click Delete on first item
    const deleteButtons = await screen.findAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    // Check if Modal is open
    expect(
      screen.getByText(/are you sure you want to delete/i),
    ).toBeInTheDocument();

    // Confirm Delete
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));

    // Verify Project Alpha is gone
    await waitFor(() => {
      expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
    });
  });
  //api call fails
  it('should show error message if API fails', async () => {
    vi.mocked(projectService.getAllProjects).mockRejectedValue(
      new Error('API Error'),
    );

    render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/No projects found/i)).toBeInTheDocument();
  });
});
