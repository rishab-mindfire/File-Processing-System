import { useState, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../Projects/ProjectReducer';
import { jobReducer, initialJobState } from './JobReducer';
import styles from './ProjectDetails.module.css';
import type { Project } from '../../models/Types';

// Requirement 3: Manual Type Definitions
interface FileItem {
  id: string;
  name: string;
  size: number;
  date: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. DERIVED STATE (Fixes Cascading Render Error)
  // We find the project directly during render instead of using useEffect
  const project: Project | undefined = MOCK_PROJECTS.find((p) => p.id === id);

  // 2. COMPONENT STATE
  const [files, setFiles] = useState<FileItem[]>([]);
  const [jobState, dispatch] = useReducer(jobReducer, initialJobState);

  // TASK 3: File Upload Logic (Using crypto.randomUUID for pure IDs)
  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const newFiles: FileItem[] = Array.from(uploadedFiles).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      date: new Date().toISOString(),
    }));

    setFiles((prev) => [...newFiles, ...prev]);
  };

  // TASK 4: Polling Simulation
  const startProcessing = (fileName: string) => {
    const jobId = crypto.randomUUID();
    dispatch({
      type: 'ADD_JOB',
      payload: { id: jobId, status: 'PENDING', progress: 0, fileName },
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;

      if (currentProgress >= 100) {
        clearInterval(interval);
        dispatch({ type: 'COMPLETE_JOB', payload: jobId });
      } else {
        dispatch({
          type: 'UPDATE_PROGRESS',
          payload: { id: jobId, progress: currentProgress },
        });
      }
    }, 600);
  };

  if (!project) {
    return (
      <div className={styles.container}>
        <p>Project not found.</p>
        <button onClick={() => navigate('/projects')}>Return to List</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={() => navigate('/projects')}
          className={styles.backBtn}>
          &larr; Back
        </button>
        <h1>{project.name}</h1>
        <p className={styles.description}>{project.description}</p>
      </header>

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}>
        <p>
          Drag & Drop files here or <strong>Browse</strong>
        </p>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          className={styles.hiddenInput}
        />
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Files ({files.length})</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{formatBytes(f.size)}</td>
                  <td>
                    <button
                      onClick={() => startProcessing(f.name)}
                      className={styles.processBtn}>
                      Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h3>Job Progress (Polling)</h3>
          {jobState.jobs.length === 0 && (
            <p className={styles.empty}>No active jobs.</p>
          )}
          {jobState.jobs.map((job) => (
            <div key={job.id} className={styles.jobItem}>
              <div className={styles.jobInfo}>
                <span className={styles.fileName}>{job.fileName}</span>
                <span className={styles.statusLabel} data-status={job.status}>
                  {job.status}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${job.progress}%` }}></div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
