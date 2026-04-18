import React, { useRef, useState, useEffect } from 'react';
import styles from '../ProjectDetails.module.css';
import type { FileItem, FileSectionProps } from '../../../models/Types';
import { formatBytes, validateFiles } from '../../../hooks/customeHooks';
import Modal from '../../../components/modal/Modal';
import { FileService } from '../../../services/fileService';

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
    FileService.listFile(projectId).then(setFiles).catch();
  }, []);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || !projectId) {
      return;
    }

    const fileArray = Array.from(selectedFiles);

    // Block folders allow only files
    const hasFolder = fileArray.some((file: any) => file.webkitRelativePath);
    if (hasFolder) {
      setUploadError('Folder upload is not allowed.');
      return;
    }

    //filter empty files
    const validFiles = fileArray.filter((file) => file.size > 0);
    if (validFiles.length === 0) {
      setUploadError('Not valid files selected');
      return;
    }

    //Generate preview URLs
    const urls = validFiles.map((file) => URL.createObjectURL(file));

    setPendingFiles(validFiles);
    setPreviewUrls(urls);
    setUploadError(null);
    setIsPreviewOpen(true);
  };

  const uploadOnServer = async () => {
    const error = validateFiles(pendingFiles);
    if (error?.errors.length > 0) {
      setUploadError(error.errors[0]);
      setIsPreviewOpen(false);
      return;
    }

    setIsPreviewOpen(false);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      setIsUploading(true);
      setUploadError('');
      setUploadProgress(0);
      const newFiles = await FileService.uploadFile(projectId, pendingFiles, setUploadProgress);

      // SUCCESS
      setFiles((prev) => [...newFiles, ...prev]);
      console.log('Uploaded files:', newFiles);
    } catch (err: any) {
      console.error('ERROR:', err);
      console.error('MESSAGE:', err?.message);
      console.error('STATUS:', err?.response?.status);
      console.error('BACKEND DATA:', err?.response?.data);

      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fieldId: string) => {
    if (fieldId) {
      const prevFiles = files;
      // optimistic update UI
      setFiles((prev) => prev.filter((f) => f._id !== fieldId));

      try {
        await FileService.deleteFile(projectId, fieldId);
      } catch (err) {
        // rollback UI
        setFiles(prevFiles);
        alert(`Delete failed ${err}`);
      }
    }
  };
  const handleDownloadFile = async (fieldId: string) => {
    try {
      const response = await FileService.downloaFile(projectId, fieldId);
      if (response) {
        const url = URL.createObjectURL(response.data);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'file';

        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
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
                <th>
                  <div className={styles.centerCell}>Action</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((f) => (
                  <tr key={f._id} className={styles.tableRow}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(f._id)}
                        onChange={() =>
                          setSelectedFileIds((prev) =>
                            prev.includes(f._id)
                              ? prev.filter((i) => i !== f._id)
                              : [...prev, f._id],
                          )
                        }
                      />
                    </td>
                    <td>
                      {f.name.length > 20
                        ? `${f.name.slice(0, 10)}.......${f.name.slice(-6)}`
                        : f.name}
                    </td>
                    <td>{formatBytes(f.size)}</td>
                    <td className={styles.actions}>
                      <button onClick={() => handleDownloadFile(f._id)} className={styles.zipBtn}>
                        Download
                      </button>
                      <button onClick={() => handleDeleteFile(f._id)} className={styles.deleteBtn}>
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
                <img src={url} alt="preview" className={styles.previewImage} />
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
