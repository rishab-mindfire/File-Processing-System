export const ZipService = {
  // ZIP generation process
  async createZip(
    fileIds: string[],
    onProgress: (percent: number) => void,
  ): Promise<{
    base64: string | undefined;
    fileName: string;
    size: number;
  }> {
    return new Promise((resolve) => {
      let progress = 0;

      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            fileName: `filename.zip`,
            size: fileIds.length * 1024 * 50,
            base64: 'base 64 fack',
          });
        }
      }, 300);
    });
  },
};
