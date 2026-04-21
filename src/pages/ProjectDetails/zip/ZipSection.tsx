import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../ProjectDetails.module.css';
import type { Job, ZipSectionProps } from '../../../models/Types';
import { zipService } from '../../../services/zipService';
import { formatBytes } from '../../../hooks/customeHooks';
import deleteBtn from '../../../assets/delete.png';
import Modal from '../../../components/modal/Modal';

/**
 * ZipSection Component
 *
 * Manages ZIP job lifecycle:
 * - Fetches existing ZIP history
 * - Starts new ZIP jobs
 * - Polls job status (progress, completion, failure)
 * - Allows download and deletion of completed ZIPs
 *
 * Key Behavior:
 * - Uses polling (3s interval) for job progress tracking
 * - Prevents duplicate job triggers using signal reference
 * - Cleans up intervals on unmount to avoid memory leaks
 *
 * @param {Object} props
 * @param {string} props.projectId - Current project ID
 * @param {string[] | null} props.newJobSignal - File IDs to trigger new ZIP job
 * @param {() => void} props.onSignalProcessed - Callback after job trigger handled
 */

export const ZipSection: React.FC<ZipSectionProps> = ({
  projectId,
  newJobSignal,
  onSignalProcessed,
}) => {
  // List of ZIP jobs (active + completed)
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Prevents re-processing same signal
  const lastProcessedSignalRef = useRef<string | null>(null);

  // Stores polling intervals per jobId
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFileSelected, setDeleteFileSelected] = useState<Job>();

  // Fetch completed ZIP history from server
  const fetchZipList = async () => {
    try {
      const completedJobs = await zipService.getZipList(projectId);
      if (completedJobs && completedJobs.length > 0) {
        setJobs(completedJobs);
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  // Load ZIP history on mount or when project changes
  useEffect(() => {
    fetchZipList();
  }, [projectId]);

  // Handles new ZIP job creation + polling
  const handleNewZipRequest = useCallback(
    async (fileIds: string[]) => {
      try {
        const { jobId } = await zipService.createZip(projectId, fileIds);

        // Add new job to UI immediately
        const newJob: Job = {
          jobId,
          status: 'PENDING',
          progress: 0,
          fileName: 'Preparing archive...',
          size: 0,
        };

        setJobs((prev) => [newJob, ...prev]);

        // Poll job status every 3 seconds
        const interval = setInterval(async () => {
          try {
            const statusRes = await zipService.getStatus(projectId, jobId);

            setJobs((currentJobs) =>
              currentJobs.map((j) =>
                j.jobId === jobId
                  ? {
                      ...j,
                      status: statusRes.status,
                      progress: statusRes.progress ?? j.progress,
                      size: statusRes.size,
                    }
                  : j,
              ),
            );

            // Stop polling when job completes or fails
            if (statusRes.status === 'COMPLETED' || statusRes.status === 'FAILED') {
              if (intervalsRef.current[jobId]) {
                clearInterval(intervalsRef.current[jobId]);
                delete intervalsRef.current[jobId];
              }

              // Refresh full list after completion
              if (statusRes.status === 'COMPLETED') {
                fetchZipList();
              }
            }
          } catch (err) {
            // Stop polling on error
            if (intervalsRef.current[jobId] && err) {
              clearInterval(intervalsRef.current[jobId]);
              delete intervalsRef.current[jobId];
            }

            setJobs((jobs) =>
              jobs.map((j) => (j.jobId === jobId ? { ...j, status: 'FAILED' } : j)),
            );
          }
        }, 3000);

        intervalsRef.current[jobId] = interval;
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    },
    [projectId],
  );

  /**
   * Listen for new ZIP trigger signal
   * Prevents duplicate execution using ref
   */
  useEffect(() => {
    const signalKey = newJobSignal?.join(',') ?? null;

    if (newJobSignal && newJobSignal.length > 0 && signalKey !== lastProcessedSignalRef.current) {
      lastProcessedSignalRef.current = signalKey;
      handleNewZipRequest(newJobSignal);
    }
  }, [newJobSignal, handleNewZipRequest]);

  //  Notify parent that signal is processed
  useEffect(() => {
    if (lastProcessedSignalRef.current !== null && jobs.length > 0) {
      onSignalProcessed();
    }
  }, [jobs, onSignalProcessed]);

  // Cleanup all polling intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, []);

  // Download completed ZIP file
  const triggerDownload = async (jobId: string, fileName: string) => {
    try {
      const res = await zipService.downloadZip(projectId, jobId);

      const url = URL.createObjectURL(res);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName || 'archive.zip';

      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  // Delete ZIP job from server
  const deleteJob = async () => {
    if (deleteFileSelected?.jobId) {
      const jobId = deleteFileSelected.jobId;

      try {
        await zipService.deleteZip(projectId, jobId);
        await fetchZipList();
      } catch (err) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        }
      }
    }

    setIsDeleteOpen(false);
  };

  return (
    <section className={styles.card} aria-labelledby="jobs-heading">
      <div className={styles.sectionHeader}>
        <h3 id="jobs-heading">Job Progress</h3>
      </div>

      {jobs.length === 0 ? (
        <p className={styles.empty} role="alert">
          No active jobs.
        </p>
      ) : (
        <div className={styles.jobList}>
          <span role="alert">{errorMessage}</span>
          {jobs.map((job) => (
            <div key={job.jobId} className={styles.jobItem} role="region" aria-label="Job details">
              <div className={styles.jobInfo}>
                <span className={styles.fileName}>{job.fileName}</span>

                {/* Status label */}
                <span
                  className={`${styles.statusLabel} ${styles[job.status]}`}
                  data-status={job.status}
                  aria-live="polite"
                >
                  {job.status}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={job.progress}
                aria-label={`Zipping progress for ${job.fileName}`}
              >
                <div className={styles.progressBar} style={{ width: `${job.progress}%` }} />
              </div>

              <div className={styles.buttom}>
                {/* Download only when completed */}
                {job.status === 'COMPLETED' && (
                  <button
                    onClick={() => triggerDownload(job.jobId, job.fileName)}
                    className={styles.iconButton}
                    aria-label={`Download ${job.fileName}`}
                  >
                    <span className={styles.download}>Downlaod</span>
                  </button>
                )}

                <div className={styles.deleteSection}>
                  <span className={styles.size}>{formatBytes(job.size ?? 0)}</span>

                  {/* Delete option (only meaningful after completion) */}
                  {job.status === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDeleteOpen(true);
                        setDeleteFileSelected(job);
                      }}
                      className={styles.iconButton}
                      aria-label="delete ZIP file"
                    >
                      <img src={deleteBtn} alt="Delete job" />
                    </button>
                  )}
                </div>
              </div>

              {/* Error state */}
              {job.status === 'FAILED' && (
                <span className={styles.error} role="alert">
                  Failed
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteFileSelected(undefined);
        }}
        title="Delete File confirm"
      >
        <div className={styles.form}>
          <p>
            <strong>{deleteFileSelected?.fileName}</strong>
          </p>
          <p>Are you sure you want to delete your zip file?</p>

          <div className={styles.modalActions}>
            <button
              onClick={() => {
                setDeleteFileSelected(undefined);
                setIsDeleteOpen(false);
              }}
              className={styles.zipBtn}
            >
              Cancel
            </button>

            <button onClick={deleteJob} className={styles.deleteBtn}>
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
