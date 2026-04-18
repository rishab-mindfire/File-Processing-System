// formate bytes
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// fack delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const validateFiles = (files: File[], maxSizeMB: number = 5) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach((file) => {
    const path = (file as any).webkitRelativePath || file.name;

    if (file.size > maxBytes) {
      errors.push(`${path} is too large (max ${maxSizeMB}MB)`);
    } else {
      validFiles.push(file);
    }
  });

  return { validFiles, errors };
};
//
