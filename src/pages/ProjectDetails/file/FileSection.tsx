import React, { useRef, useState, useEffect } from 'react';
import styles from '../ProjectDetails.module.css';
import type { FileItem, FileSectionProps } from '../../../models/Types';
import { FileReceiveService } from '../../../services/FileReceiveService';
import { FileUploadService } from '../../../services/FileUploadService';
import { formatBytes, validateFiles } from '../../../hooks/customeHooks';
import Modal from '../../../components/modal/Modal';

export const FileSection: React.FC<FileSectionProps> = ({ projectId, onStartZip }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview States
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    FileReceiveService.list(projectId).then(setFiles).catch();
  }, [projectId]);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || !projectId) {
      return;
    }

    const fileArray = Array.from(selectedFiles);
    const urls = fileArray.map((file) => URL.createObjectURL(file));

    setPendingFiles(fileArray);
    setPreviewUrls(urls);
    setIsPreviewOpen(true);
  };

  const uploadOnServer = () => {
    const error = validateFiles(pendingFiles);
    if (error?.errors.length > 0) {
      setUploadError(error.errors[0]);
      setIsPreviewOpen(false);
      return;
    }

    setIsPreviewOpen(false);
    setIsUploading(true);
    setUploadError(null);

    FileUploadService.upload(
      projectId,
      pendingFiles,
      (percent) => setUploadProgress(percent),
      (newFiles) => {
        setFiles((prev) => [...newFiles, ...prev]);
        setIsUploading(false);
        setPendingFiles([]);
        setPreviewUrls([]);
      },
      async (err, mockRecoveredFiles) => {
        setUploadError(err);
        setIsUploading(false);
        if (mockRecoveredFiles) {
          setFiles((prev) => [...mockRecoveredFiles, ...prev]);
        }
      },
    );
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await FileReceiveService.delete(projectId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      alert(`Delete failed ${err}`);
    }
  };

  return (
    <section className={styles.fileSection}>
      {uploadError && <div className={styles.validationErrro}>{uploadError}</div>}

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileSelection(e.dataTransfer.files);
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className={styles.uploadingState}>
            <p>Uploading... {uploadProgress}%</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
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
          onChange={(e) => handleFileSelection(e.target.files)}
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
            className={styles.zipBtn}
          >
            Create ZIP Job
          </button>
        </div>
        <div className={styles.mainTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Select</th>
                <th className={styles.fileNames}>Name</th>
                <th className={styles.sizeTd}>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((f) => (
                  <tr key={f.id} className={styles.tableRow}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(f.id)}
                        onChange={() =>
                          setSelectedFileIds((prev) =>
                            prev.includes(f.id) ? prev.filter((i) => i !== f.id) : [...prev, f.id],
                          )
                        }
                      />
                    </td>
                    <td>{f.name}</td>
                    <td>{formatBytes(f.size)}</td>
                    <td>
                      <button onClick={() => handleDeleteFile(f.id)} className={styles.deleteBtn}>
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
      </div>

      {/* Instant Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Selected Files"
      >
        <div className={styles.previewGrid}>
          {previewUrls.map((url, idx) => (
            <div key={idx} className={styles.previewItem}>
              {pendingFiles[idx]?.type.startsWith('image/') ? (
                <img src={url} alt="preview thumb" className={styles.previewImage} />
              ) : (
                <div className={styles.filePlaceholder}>
                  {pendingFiles[idx]?.name.split('.').pop()?.toUpperCase()}
                </div>
              )}
              <span className={styles.fileName}>{pendingFiles[idx]?.name}</span>
            </div>
          ))}
        </div>

        <div className={styles.modalActions}>
          <button onClick={() => setIsPreviewOpen(false)} className={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={uploadOnServer} className={styles.saveBtn}>
            Save & Upload
          </button>
        </div>
      </Modal>
    </section>
  );
};
