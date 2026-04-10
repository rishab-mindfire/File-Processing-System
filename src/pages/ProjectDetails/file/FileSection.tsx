import React, { useRef, useState, useEffect } from 'react';
import styles from '../ProjectDetails.module.css';
import type { FileItem, FileSectionProps } from '../../../models/Types';
import { FileReceiveService } from '../../../services/FileReceiveService';
import { FileUploadService } from '../../../services/FileUploadService';
import { formatBytes } from '../../../hooks/customeHooks';

export const FileSection: React.FC<FileSectionProps> = ({
  projectId,
  onStartZip,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    //Api can be integrated for getting all lists of file that user have uploaded based on project id
    FileReceiveService.list(projectId).then(setFiles).catch(console.error);
  }, [projectId]);

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || !projectId) return;
    setIsUploading(true);
    setUploadError(null);

    FileUploadService.upload(
      projectId,
      Array.from(uploadedFiles),
      (percent) => setUploadProgress(percent),
      (newFiles) => {
        setFiles((prev) => [...newFiles, ...prev]);
        setIsUploading(false);
      },
      async (err, mockRecoveredFiles) => {
        setUploadError(err);
        setIsUploading(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (mockRecoveredFiles) {
          setFiles((prev) => [...mockRecoveredFiles, ...prev]);
        }
      },
    );
  };

  //deleting file
  const handleDeleteFile = async (fileId: string) => {
    try {
      await FileReceiveService.delete(projectId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.log(err);
      alert('Delete failed');
    }
  };

  return (
    <section className={styles.fileSection}>
      {uploadError}

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
            <p>Uploading... {uploadProgress}%</p>
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

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3>Files ({files.length})</h3>
          <button
            onClick={() => {
              onStartZip(selectedFileIds);
              setSelectedFileIds([]);
            }}
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
                  <div className={styles.noFiles}> No Files !</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
