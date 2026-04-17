import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../ProjectDetails.module.css';
import type { Job } from '../../../models/Types';
import { ZipService } from '../../../services/ZipService';

interface ZipSectionProps {
  newJobSignal: string[] | null;
  onSignalProcessed: () => void;
}

interface JobWithData extends Job {
  base64?: string;
}

export const ZipSection: React.FC<ZipSectionProps> = ({ newJobSignal, onSignalProcessed }) => {
  const [jobs, setJobs] = useState<JobWithData[]>([]);

  const lastProcessedSignalRef = useRef<string | null>(null);

  const handleNewZipRequest = useCallback(async (fileIds: string[]) => {
    const jobId = crypto.randomUUID();

    const newJob: JobWithData = {
      id: jobId,
      status: 'PENDING',
      progress: 0,
      fileName: 'Preparing archive...',
    };

    setJobs((prev) => [newJob, ...prev]);

    try {
      const result = await ZipService.createZip(fileIds, (percent: number) => {
        setJobs((currentJobs) =>
          currentJobs.map((j) =>
            j.id === jobId ? { ...j, progress: percent, status: 'PROCESSING' } : j,
          ),
        );
      });

      //job store
      setJobs((currentJobs) =>
        currentJobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'COMPLETED',
                progress: 100,
                fileName: result.fileName,
                base64: result.base64,
              }
            : j,
        ),
      );
    } catch (error) {
      if (error) {
        setJobs((currentJobs) =>
          currentJobs.map((j) => (j.id === jobId ? { ...j, status: 'FAILED' } : j)),
        );
      }
    }
  }, []);

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

  const triggerDownload = (base64: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${base64}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div key={job.id} className={styles.jobItem}>
              <div className={styles.jobInfo}>
                <span className={styles.fileName}>{job.fileName}</span>
                <span className={styles.statusLabel} data-status={job.status}>
                  {job.status}
                </span>
              </div>

              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${job.progress}%` }} />
              </div>

              {job.status === 'COMPLETED' && job.base64 && (
                <button
                  onClick={() => triggerDownload(job.base64 as string, job.fileName)}
                  className={styles.download}
                >
                  Download
                </button>
              )}

              {job.status === 'FAILED' && <span className={styles.error}>Failed</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
