import { useState, useReducer, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../Projects/ProjectReducer';
import { jobReducer, initialJobState } from './JobReducer';
import styles from './ProjectDetails.module.css';
import type { FileItem, Project } from '../../models/Types';
import { formatBytes } from '../../hooks/customeHooks';
import { FileReceiveService } from '../../services/FileReceiveService';
import { FileUploadService } from '../../services/FileUploadService';

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

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 1. Fetch initial files on mount
  useEffect(() => {
    if (projectId) {
      FileReceiveService.list(projectId).then(setFiles).catch(console.error);
    }
  }, [projectId]);

  // 2. Centralized Polling Logic (Prevents Memory Leaks)
  useEffect(() => {
    const pendingJobs = jobState.jobs.filter(
      (j) => j.status === 'PENDING' || j.status === 'PROCESSING',
    );

    if (pendingJobs.length === 0) return;

    const pollInterval = setInterval(() => {
      pendingJobs.forEach((job) => {
        const nextProgress = job.progress + 20; // Simulated polling increments
        if (nextProgress >= 100) {
          dispatch({ type: 'COMPLETE_JOB', payload: job.id });
        } else {
          dispatch({
            type: 'UPDATE_PROGRESS',
            payload: { id: job.id, progress: nextProgress },
          });
        }
      });
    }, 2000);

    return () => clearInterval(pollInterval); // Cleanup on unmount/job finish
  }, [jobState.jobs]);

  // 3. File Upload Handler

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || !projectId) return;

    setIsUploading(true);
    setUploadError(null);

    FileUploadService.upload(
      projectId,
      Array.from(uploadedFiles),
      (percent) => setUploadProgress(percent),
      (newFiles) => {
        // Path A: Smooth Success
        setFiles((prev) => [...newFiles, ...prev]);
        setIsUploading(false);
      },
      async (err, mockRecoveredFiles) => {
        // Path B: Network Failure (Wait 5 seconds reached)
        setUploadError(err);
        setIsUploading(false);

        // FAKE RECOVERY LOGIC:
        // Even though the API "failed" in the frontend,
        // we check the server list after a short pause.
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (mockRecoveredFiles) {
          console.log('Files actually reached the server despite UI error.');
          // This simulates the "FileReceiveService.list()" call picking up the new files
          setFiles((prev) => [...mockRecoveredFiles, ...prev]);
        }
      },
    );
  };

  // 4. Delete Handler
  const handleDeleteFile = async (fileId: string) => {
    if (!projectId) return;
    try {
      await FileReceiveService.delete(projectId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.log(err);
      alert('Delete failed');
    }
  };

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

    setSelectedFileIds([]);
  };

  const triggerDownload = (fileName: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/zip;base64,AAA=');
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!project)
    return (
      <div className={styles.container}>
        <div className={styles.noProjects}>Project not found.</div>
      </div>
    );

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
      {uploadError && (
        <div className={styles.errorBanner}>
          <p>⚠️ {uploadError}</p>
          <button onClick={() => setUploadError(null)}>Dismiss</button>
        </div>
      )}
      <section className={styles.projectInfo}>
        <div>
          <span>{project.description}</span>
        </div>
      </section>

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}>
        {isUploading ? (
          <div className={styles.uploadingState}>
            <p> Uploading... {uploadProgress}%</p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <p>
            Drag & Drop files or <strong>Browse</strong>
          </p>
        )}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className={styles.hiddenInput}
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isUploading}
        />
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h3>
              Files (<span className={styles.files}>{files.length}</span>)
            </h3>
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
                <th className={styles.sizeTd}>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((f) => (
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
                        onClick={() => handleDeleteFile(f.id)}
                        className={styles.deleteBtn}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className={styles.noFiles}>
                      Please drag and drop files
                    </div>
                  </td>
                </tr>
              )}
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
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              {job.status === 'COMPLETED' && (
                <button
                  onClick={() => triggerDownload(job.fileName)}
                  className={styles.download}>
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
