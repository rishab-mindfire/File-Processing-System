import { useState, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../Projects/ProjectReducer';
import { jobReducer, initialJobState } from './JobReducer';
import styles from './ProjectDetails.module.css';
import type { FileItem, Project } from '../../models/Types';
import { formatBytes } from '../../hooks/customeHooks';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const project: Project | undefined = MOCK_PROJECTS.find(
    (p) => p.id === projectId,
  );

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [jobState, dispatch] = useReducer(jobReducer, initialJobState);

  // FILE UPLOAD ---
  const handleFileUpload = (uploadedFiles: FileList | null) => {
    console.log(uploadedFiles);
    if (!uploadedFiles) return;

    // Manual FormData usage
    const formData = new FormData();
    Array.from(uploadedFiles).forEach((file) => formData.append('files', file));

    const newFiles: FileItem[] = Array.from(uploadedFiles).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      uploadedAt: new Date().toISOString(),
    }));

    setFiles((prev) => [...newFiles, ...prev]);
  };

  // --- JOB POLLING later integrate with APII ---
  const startZipJob = () => {
    if (selectedFileIds.length === 0) return;

    const jobId = crypto.randomUUID();
    dispatch({
      type: 'ADD_JOB',
      payload: {
        id: jobId,
        status: 'PENDING',
        progress: 0,
        fileName: `archive_${jobId.slice(0, 8)}.zip`,
      },
    });

    let currentProgress = 0;

    // setInterval uii pause
    const interval = window.setInterval(() => {
      // 5% each second progress
      currentProgress += 5;

      if (currentProgress >= 100) {
        window.clearInterval(interval);
        dispatch({ type: 'COMPLETE_JOB', payload: jobId });
      } else {
        dispatch({
          type: 'UPDATE_PROGRESS',
          payload: { id: jobId, progress: currentProgress },
        });
      }
    }, 1000);

    setSelectedFileIds([]);
  };

  const triggerDownload = (fileName: string) => {
    // Trigger file download
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' +
        encodeURIComponent('Dummy ZIP Content'),
    );
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!project)
    return <div className={styles.container}>Project not found.</div>;

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

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}>
        <p>
          Drag & Drop files or <strong>Browse</strong>
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
          <div className={styles.sectionHeader}>
            <h3>Files ({files.length})</h3>
            <button
              onClick={startZipJob}
              disabled={selectedFileIds.length === 0}
              className={styles.zipBtn}>
              Create ZIP Job
            </button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(f.id)}
                      onChange={() =>
                        setSelectedFileIds((prev) =>
                          prev.includes(f.id)
                            ? prev.filter((i) => i !== f.id)
                            : [...prev, f.id],
                        )
                      }
                    />
                  </td>
                  <td>{f.name}</td>
                  <td>{formatBytes(f.size)}</td>
                  <td>
                    <button
                      onClick={() =>
                        setFiles(files.filter((file) => file.id !== f.id))
                      }
                      className={styles.deleteBtn}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h3>Job Progress</h3>
          {jobState.jobs.length === 0 && (
            <p className={styles.empty}>No active jobs.</p>
          )}
          {jobState.jobs.map((job) => (
            <div key={job.id} className={styles.jobItem}>
              <div className={styles.jobInfo}>
                <span>{job.fileName}</span>
                <span className={styles.statusLabel} data-status={job.status}>
                  {job.status}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${job.progress}%` }}></div>
              </div>
              {job.status === 'COMPLETED' && (
                <button
                  onClick={() => triggerDownload(job.fileName)}
                  className={styles.downloadBtn}>
                  Download
                </button>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
