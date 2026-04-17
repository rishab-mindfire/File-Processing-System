export const ZipService = {
  async createZip(
    fileIds: string[],
    onProgress: (percent: number) => void,
  ): Promise<{
    base64: string | undefined;
    fileName: string;
    size: number;
  }> {
    return new Promise((resolve) => {
      //api call can be here as of now use mock progress and data
      let progress = 0;

      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            fileName: 'filename.zip',
            size: fileIds.length * 1024 * 50,
            base64: 'base 64 fack',
          });
        }
      }, 300);
    });
  },
};
