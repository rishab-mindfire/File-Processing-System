import { useEffect, useRef, useState } from 'react';
import type { FileItem, FileSectionProps } from '../../../models/Types';
import { FileService } from '../../../services/fileService';
import { formatBytes, validateFiles } from '../../../hooks/customeHooks';
import styles from '../ProjectDetails.module.css';
import Modal from '../../../components/modal/Modal';
import deleteBtn from '../../../assets/delete.png';
import downloadBtn from '../../../assets/download.png';

/**
 * FileSection Component
 *
 * Handles file management for a project:
 * - Upload files (with preview + validation)
 * - Display uploaded files
 * - Select files for ZIP creation
 * - Download and delete files
 *
 * Key Features:
 * - Drag & drop + manual file selection
 * - Preview before upload
 * - Upload progress tracking
 * - Optimistic UI update for delete
 *
 * @param {Object} props
 * @param {string} props.projectId - Unique project identifier
 * @param {(fileIds: string[]) => void} props.onStartZip - Callback to trigger ZIP creation
 */
export const FileSection: React.FC<FileSectionProps> = ({ projectId, onStartZip }) => {
  // Stores all uploaded files
  const [files, setFiles] = useState<FileItem[]>([]);

  // Tracks selected file IDs for ZIP operation
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Upload state management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFileSelected, setDeleteFileSelected] = useState<FileItem>();

  // Error handling for uploads
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file input reference (for triggering click)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview states (before upload)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /**
   * Fetch files on component mount
   */
  useEffect(() => {
    FileService.listFile(projectId).then(setFiles).catch();
  }, []);

  /**
   * Cleanup: revoke generated preview URLs to prevent memory leaks
   */
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  /**
   * Handles file selection (drag-drop or input)
   * - Filters invalid files
   * - Blocks folder uploads
   * - Generates preview URLs
   */
  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || !projectId) {
      return;
    }

    const fileArray = Array.from(selectedFiles);

    // Block folder uploads (browser-specific property)
    const hasFolder = fileArray.some((file: any) => file.webkitRelativePath);
    if (hasFolder) {
      setUploadError('Folder upload is not allowed.');
      return;
    }

    // Filter out empty files
    const validFiles = fileArray.filter((file) => file.size > 0);
    if (validFiles.length === 0) {
      setUploadError('Not valid files selected');
      return;
    }

    // Create preview URLs for UI display
    const urls = validFiles.map((file) => URL.createObjectURL(file));

    setPendingFiles(validFiles);
    setPreviewUrls(urls);
    setUploadError(null);
    setIsPreviewOpen(true);
  };

  /**
   * Upload files to server after validation
   * - Validates files before upload
   * - Tracks progress
   * - Updates UI on success
   */
  const uploadOnServer = async () => {
    const error = validateFiles(pendingFiles);

    // Stop upload if validation fails
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
      const newFiles = await FileService.uploadFile(projectId, pendingFiles, setUploadProgress);

      // Add newly uploaded files to the top of list
      setFiles((prev) => [...newFiles, ...prev]);
    } catch (err: any) {
      // Capture backend or network error
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Downloads a file from server
   * - Converts blob to downloadable link
   */
  const handleDownloadFile = async (fieldId: string) => {
    try {
      const response = await FileService.downloaFile(projectId, fieldId);
      if (response) {
        const url = URL.createObjectURL(response.data);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'file'; // You may want to pass actual filename

        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Deletes selected file
   * - Uses optimistic UI update for better UX
   * - Rolls back if API fails
   */
  const handleDeleteFile = async () => {
    if (deleteFileSelected?._id) {
      const fieldId = deleteFileSelected._id;
      const prevFiles = files;

      // Optimistically remove file from UI
      setFiles((prev) => prev.filter((f) => f._id !== fieldId));

      try {
        await FileService.deleteFile(projectId, fieldId);
      } catch (err) {
        // Rollback UI if delete fails
        setFiles(prevFiles);
        alert(`Delete failed ${err}`);
      }
    }

    setIsDeleteOpen(false);
  };

  return (
    <section className={styles.fileSection}>
      {/* Display upload errors */}
      {uploadError && <div className={styles.validationErrro}>{uploadError}</div>}

      {/* File Upload Drop Zone */}
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

            {/* Progress bar */}
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <p>
            Drag & Drop files or <strong>Browse</strong>
          </p>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className={styles.hiddenInput}
          onChange={(e) => handleFileSelection(e.target.files)}
          disabled={isUploading}
        />
      </div>

      {/* File List Section */}
      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3>Files ({files.length})</h3>

          {/* Trigger ZIP creation with selected files */}
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

        {/* Files Table */}
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
                      {/* File selection checkbox */}
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

                    {/* File name (truncated if long) */}
                    <td>
                      {f.name.length > 30
                        ? `${f.name.slice(0, 10)}.......${f.name.slice(-16)}`
                        : f.name}
                    </td>

                    {/* File size */}
                    <td>{formatBytes(f.size)}</td>

                    {/* Actions */}
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleDownloadFile(f._id)}
                        className={styles.iconButton}
                      >
                        <img src={downloadBtn} alt="Downlaod file" />
                      </button>

                      <button
                        onClick={() => {
                          setDeleteFileSelected(f);
                          setIsDeleteOpen(true);
                        }}
                        className={styles.iconButton}
                      >
                        <img src={deleteBtn} alt="Delete file" />
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

      {/* Preview Modal before upload */}
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
            <strong>{deleteFileSelected?.name}</strong>
          </p>
          <p>Are you sure you want to delete your File from list ?</p>

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

            <button onClick={() => handleDeleteFile()} className={styles.deleteBtn}>
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
