import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProjectDetails.module.css';
import { FileSection } from './file/FileSection';
import { ZipSection } from './zip/ZipSection';
import type { Project } from '../../models/Types';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [jobTrigger, setJobTrigger] = useState<string[] | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        return;
      }

      try {
        setLoading(true);
        const data = await projectService.getProjectById(projectId);
        setProject(data);
      } catch (err) {
        if (err) {
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

  // Error State
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
      <header className={styles.header}>
        <button onClick={() => navigate('/projects')} className={styles.backBtn}>
          &larr; Back
        </button>
        <h1>{project.projectName}</h1>
      </header>

      <section className={styles.projectInfo}>
        <span>{project.description}</span>
      </section>

      <div className={styles.grid}>
        <FileSection projectId={projectId!} onStartZip={(ids) => setJobTrigger(ids)} />
        <ZipSection newJobSignal={jobTrigger} onSignalProcessed={() => setJobTrigger(null)} />
      </div>
    </div>
  );
}
