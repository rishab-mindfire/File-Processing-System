import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../ProjectDetails.module.css';
import type { Job } from '../../../models/Types';
import { ZipService } from '../../../services/zipService';
import { formatBytes } from '../../../hooks/customeHooks';

interface ZipSectionProps {
  newJobSignal: string[] | null;
  onSignalProcessed: () => void;
  projectId: string;
}

export const ZipSection: React.FC<ZipSectionProps> = ({
  projectId,
  newJobSignal,
  onSignalProcessed,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);

  const lastProcessedSignalRef = useRef<string | null>(null);
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // fetch existing zip history
  const fetchZipList = async () => {
    try {
      const res = await ZipService.getZipList(projectId);

      const completedJobs = res.data.map((zip: any) => ({
        jobId: zip.jobId,
        status: 'COMPLETED',
        progress: 100,
        fileName: zip.fileName,
        completedAt: zip.completedAt,
        size: zip.size,
      }));

      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.jobId));

        // avoid duplicates
        const merged = [...completedJobs.filter((j: any) => !existingIds.has(j.jobId)), ...prev];

        return merged;
      });
    } catch (err) {
      console.error('Failed to fetch zip list', err);
    }
  };

  useEffect(() => {
    fetchZipList();
  }, []);

  const handleNewZipRequest = useCallback(
    async (fileIds: string[]) => {
      try {
        const { jobId } = await ZipService.createZip(projectId, fileIds);

        const newJob: Job = {
          jobId,
          status: 'PENDING',
          progress: 0,
          fileName: 'Preparing archive...',
          size: 0,
        };

        setJobs((prev) => [newJob, ...prev]);

        // polling
        const interval = setInterval(async () => {
          try {
            const statusRes = await ZipService.getStatus(projectId, jobId);

            setJobs((currentJobs) =>
              currentJobs.map((j) =>
                j.jobId === jobId
                  ? {
                      ...j,
                      status: statusRes.status,
                      progress: statusRes.progress ?? j.progress,
                      fileName:
                        statusRes.status === 'COMPLETED'
                          ? statusRes.fileName //force replace
                          : j.fileName,
                    }
                  : j,
              ),
            );

            if (statusRes.status === 'COMPLETED') {
              clearInterval(intervalsRef.current[jobId]);
              delete intervalsRef.current[jobId];

              // refresh list after completion
              fetchZipList();
            }

            if (statusRes.status === 'FAILED') {
              clearInterval(intervalsRef.current[jobId]);
              delete intervalsRef.current[jobId];
            }
          } catch (err) {
            clearInterval(intervalsRef.current[jobId]);
            delete intervalsRef.current[jobId];

            setJobs((jobs) =>
              jobs.map((j) => (j.jobId === jobId ? { ...j, status: 'FAILED' } : j)),
            );
          }
        }, 3000);

        intervalsRef.current[jobId] = interval;
      } catch (error) {
        console.error(error);
      }
    },
    [projectId],
  );

  useEffect(() => {
    const signalKey: string | null = newJobSignal?.join(',') ?? null;

    if (newJobSignal && newJobSignal.length > 0 && signalKey !== lastProcessedSignalRef.current) {
      lastProcessedSignalRef.current = signalKey;
      handleNewZipRequest(newJobSignal);
    }
  }, [newJobSignal, handleNewZipRequest]);

  useEffect(() => {
    if (lastProcessedSignalRef.current !== null) {
      onSignalProcessed();
    }
  }, [jobs, onSignalProcessed]);

  // cleanup
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, []);

  const triggerDownload = async (jobId: string, fileName: string) => {
    try {
      const res = await ZipService.downloadZip(projectId, jobId);

      const url = URL.createObjectURL(res.data);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;

      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h3>Job Progress</h3>
      </div>

      {jobs.length === 0 ? (
        <p className={styles.empty}>No active jobs.</p>
      ) : (
        <div className={styles.jobList}>
          {jobs.map((job) => (
            <div key={job.jobId} className={styles.jobItem}>
              <div className={styles.jobInfo}>
                <span className={styles.fileName}>{job.fileName}</span>
                <span className={styles.statusLabel} data-status={job.status}>
                  {job.status}
                </span>
              </div>

              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${job.progress}%` }} />
              </div>

              <div className={styles.buttom}>
                {job.status === 'COMPLETED' && (
                  <button
                    onClick={() => triggerDownload(job.jobId, job.fileName)}
                    className={styles.download}
                  >
                    Download
                  </button>
                )}
                <span className={styles.size}>{formatBytes(job.size)}</span>
              </div>
              {job.status === 'FAILED' && <span className={styles.error}>Failed</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
