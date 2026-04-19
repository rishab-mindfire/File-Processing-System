import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import ProjectDetails from './ProjectDetails';
import '@testing-library/jest-dom';
import type { Project } from '../../models/Types';

const MOCK_PROJECTS: Project[] = [
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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Sub-components
vi.mock('./file/FileSection', () => ({
  FileSection: ({ onStartZip }: { onStartZip: (ids: string[]) => void }) => (
    <button onClick={() => onStartZip(['file-1'])}>Mock Start Zip</button>
  ),
}));

vi.mock('./zip/ZipSection', () => ({
  ZipSection: () => <div>Mock Zip Section</div>,
}));

describe('ProjectDetails Component', () => {
  const renderWithRouter = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('should render project details when a valid ID is provided', () => {
    const targetProject = MOCK_PROJECTS[0];
    renderWithRouter(targetProject._id);

    expect(screen.getByText(targetProject.projectName)).toBeInTheDocument();
    expect(screen.getByText(targetProject.projectDescription)).toBeInTheDocument();
  });

  it('should show "Project not found" when an invalid ID is provided', () => {
    renderWithRouter('999999999');

    expect(screen.getByText(/project not found/i)).toBeInTheDocument();
  });

  it('should navigate back to project list when Back button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(MOCK_PROJECTS[0]._id);

    const backBtn = screen.getByRole('button', { name: /back/i });
    await user.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('should update jobTrigger when FileSection signals a zip start', async () => {
    const user = userEvent.setup();
    renderWithRouter(MOCK_PROJECTS[0]._id);

    // Click the button in our mocked FileSection
    const zipBtn = screen.getByText('Mock Start Zip');
    await user.click(zipBtn);

    expect(screen.getByText('Mock Zip Section')).toBeInTheDocument();
  });
});
