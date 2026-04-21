import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProjectDetails.module.css';
import { FileSection } from './file/FileSection';
import { ZipSection } from './zip/ZipSection';
import type { Project } from '../../models/Types';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';

/**
 * ProjectDetails Page
 *
 * Responsible for:
 * - Fetching and displaying a single project's details
 * - Coordinating FileSection and ZipSection
 * - Passing file selection → ZIP job trigger
 *
 * Data Flow:
 * FileSection → (selected file IDs) → ProjectDetails → ZipSection
 *
 * @component
 */
export default function ProjectDetails() {
  // Extract projectId from route params
  const { projectId } = useParams<{ projectId: string }>();

  const navigate = useNavigate();

  /**
   * Used as a signal to trigger ZIP job creation in ZipSection.
   * When FileSection calls `onStartZip`, this gets updated.
   */
  const [jobTrigger, setJobTrigger] = useState<string[] | null>(null);

  // Project data state
  const [project, setProject] = useState<Project | null>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState(false);

  // Fetch project details on mount or when projectId changes
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        return;
      }
      try {
        setLoading(true);
        const data = await projectService.getProjectById(projectId);
        setProject(data);
      } catch (error) {
        if (error) {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Loading State
  if (loading) {
    return (
      <div className={styles.spinner} role="status" aria-live="polite">
        <Loader />
      </div>
    );
  }

  // Not Found State of project
  if (!project || err) {
    return (
      <div className={styles.container} role="alert">
        <div className={styles.noProjects}>Project not found.</div>

        <div className={styles.noProjectsData}>
          <button
            onClick={() => navigate('/projects')}
            className={styles.backBtn}
            aria-label="Return to the projects list"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <button
          onClick={() => navigate('/projects')}
          className={styles.backBtn}
          aria-label="Back to Projects List"
        >
          &larr; Back
        </button>

        <section className={styles.projectInfo}>
          <h1>{project.projectName}</h1>
          <span>{project.projectDescription}</span>
        </section>
      </header>

      {/* Main Content Grid */}
      <main className={styles.grid} role="main">
        {/* File Upload & Selection Section */}
        <section aria-label="File Management">
          <FileSection projectId={projectId!} onStartZip={(ids) => setJobTrigger(ids)} />
        </section>

        {/* ZIP Job Tracking Section */}
        <section aria-label="ZIP Export Jobs">
          <ZipSection
            projectId={projectId!}
            newJobSignal={jobTrigger}
            onSignalProcessed={() => setJobTrigger(null)} // reset trigger after handling
          />
        </section>
      </main>
    </div>
  );
}
