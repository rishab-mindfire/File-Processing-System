import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../../reducers/ProjectReducer';
import styles from './ProjectDetails.module.css';
import { FileSection } from './file/FileSection';
import { ZipSection } from './zip/ZipSection';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [jobTrigger, setJobTrigger] = useState<string[] | null>(null);

  const project = MOCK_PROJECTS.find((p) => p.id === projectId);

  if (!project || !projectId)
    return <div className={styles.noProjects}>Project not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={() => navigate('/projects')}
          className={styles.backBtn}>
          &larr; Back
        </button>
        <h1>{project.name}</h1>
      </header>

      <section className={styles.projectInfo}>
        <span>{project.description}</span>
      </section>

      <div className={styles.grid}>
        <FileSection
          projectId={projectId}
          onStartZip={(ids) => setJobTrigger(ids)}
        />
        <ZipSection
          newJobSignal={jobTrigger}
          onSignalProcessed={() => setJobTrigger(null)}
        />
      </div>
    </div>
  );
}
