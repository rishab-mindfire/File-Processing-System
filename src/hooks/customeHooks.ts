import axios from 'axios';

/**
 * Converts a file size in bytes into a human-readable string.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.23 MB", "512 KB")
 *
 * @example
 * formatBytes(1024) // "1 KB"
 * formatBytes(1048576) // "1 MB"
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Creates a delay (useful for testing/loading simulation).
 *
 * @param ms - Delay duration in milliseconds
 * @returns Promise that resolves after the specified time
 *
 * @example
 * await delay(1000); // waits 1 second
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validates a list of files against size constraints.
 *
 * @param files - Array of files to validate
 * @param maxSizeMB - Maximum allowed file size in MB (default: 5MB)
 * @returns Object containing valid files and error messages
 *
 * @example
 * const { validFiles, errors } = validateFiles(files, 10);
 */
export const validateFiles = (
  files: File[],
  maxSizeMB: number = 5,
): { validFiles: File[]; errors: string[] } => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach((file) => {
    // Some browsers include folder path when uploading directories
    const path =
      'webkitRelativePath' in file && file.webkitRelativePath ? file.webkitRelativePath : file.name;

    if (file.size > maxBytes) {
      errors.push(`${path} is too large (max ${maxSizeMB}MB)`);
    } else {
      validFiles.push(file);
    }
  });

  return { validFiles, errors };
};

/**
 * Formats a date string into a readable format.
 *
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "April 19, 2026, 10:30 AM")
 *
 * @example
 * formatDate("2026-04-19T10:30:00Z")
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Error message handler
 *
 * Handles:
 * - Axios API errors
 * - Standard JavaScript errors
 * - Unknown values
 *
 * @param error - Unknown error object
 * @returns Readable error message
 *
 * @example
 * try {
 *   await apiCall();
 * } catch (err) {
 *   console.log(getErrorMessage(err));
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
