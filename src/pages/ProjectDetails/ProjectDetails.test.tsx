import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as ReactRouterDom from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProjectDetails from './ProjectDetails';
import '@testing-library/jest-dom';
import { projectService } from '../../services/projectService';
import { MOCK_PROJECTS } from '../../../test/testMock';

// ---------------- MOCK ROUTE NAVIGATION ----------------
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---------------- MOCK SERVICE ----------------
vi.mock('../../services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
  },
}));

// ---------------- MOCK CHILD COMPONENTS ----------------
vi.mock('./file/FileSection', () => ({
  FileSection: ({ onStartZip }: { onStartZip: (ids: string[]) => void }) => (
    <button onClick={() => onStartZip(['file-1'])}>Mock Start Zip</button>
  ),
}));

vi.mock('./zip/ZipSection', () => ({
  ZipSection: () => <div>Mock Zip Section</div>,
}));

// ---------------- HELPER ----------------
const renderWithRouter = (projectId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>
    </MemoryRouter>,
  );
};

// ---------------- TESTS ----------------
describe('ProjectDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // SUCCESS CASE
  it('should render project details when valid ID is provided', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(MOCK_PROJECTS[0]);

    renderWithRouter(MOCK_PROJECTS[0]._id);

    expect(await screen.findByText('Project 1')).toBeInTheDocument();
    expect(await screen.findByText(/Main production website assets files/i)).toBeInTheDocument();
  });

  // NOT FOUND CASE
  it('should show Project not found when API fails', async () => {
    vi.mocked(projectService.getProjectById).mockRejectedValue(new Error('Not found'));

    renderWithRouter('999');

    expect(await screen.findByText(/project not found/i)).toBeInTheDocument();
  });

  // BACK BUTTON
  it('should navigate back to project list when Back button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(projectService.getProjectById).mockResolvedValue(MOCK_PROJECTS[0]);

    renderWithRouter(MOCK_PROJECTS[0]._id);

    const backBtn = await screen.findByRole('button', { name: /back/i });

    await user.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  // FILE to ZIP FLOW
  it('should update jobTrigger when FileSection signals a zip start', async () => {
    const user = userEvent.setup();

    vi.mocked(projectService.getProjectById).mockResolvedValue(MOCK_PROJECTS[0]);

    renderWithRouter(MOCK_PROJECTS[0]._id);

    const zipBtn = await screen.findByText('Mock Start Zip');
    await user.click(zipBtn);

    expect(await screen.findByText('Mock Zip Section')).toBeInTheDocument();
  });
});
