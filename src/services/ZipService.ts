export const ZipService = {
  // Simulates a backend ZIP generation process
  async createZip(
    fileIds: string[],
    onProgress: (percent: number) => void,
  ): Promise<{
    base64: any | string | undefined;
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
            fileName: `archive_${Math.floor(Math.random() * 1000)}.zip`,
            size: fileIds.length * 1024 * 50, // Mock size calculation
          });
        }
      }, 300); // Fast mock updates every 300ms
    });
  },
};
