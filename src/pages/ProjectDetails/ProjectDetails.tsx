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
      <div className={styles.spinner}>
        <Loader />
      </div>
    );
  }

  // Not Found State of project
  if (!project || err) {
    return (
      <div className={styles.container}>
        <div className={styles.noProjects}>Project not found.</div>

        <div className={styles.noProjectsData}>
          <button onClick={() => navigate('/projects')} className={styles.backBtn}>
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
        <button onClick={() => navigate('/projects')} className={styles.backBtn}>
          &larr; Back
        </button>

        <section className={styles.projectInfo}>
          <h1>{project.projectName}</h1>
          <span>{project.projectDescription}</span>
        </section>
      </header>

      {/* Main Content Grid */}
      <div className={styles.grid}>
        {/* File Upload & Selection Section */}
        <FileSection projectId={projectId!} onStartZip={(ids) => setJobTrigger(ids)} />

        {/* ZIP Job Tracking Section */}
        <ZipSection
          projectId={projectId!}
          newJobSignal={jobTrigger}
          onSignalProcessed={() => setJobTrigger(null)} // reset trigger after handling
        />
      </div>
    </div>
  );
}
