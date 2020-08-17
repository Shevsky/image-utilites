export function readBlobBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise(
    (
      resolve: (buffer: ArrayBuffer) => void,
      reject: (error: Error) => void
    ): void => {
      if (!FileReader) {
        return reject(new TypeError('FileReader unavailable'));
      }

      const reader = new FileReader();

      reader.onerror = (): void => reject(new Error('Unreadable file'));
      reader.onloadend = (event: ProgressEvent<FileReader>): void => {
        const result = event.target?.result;
        if (!(result instanceof ArrayBuffer)) {
          return reject(new TypeError('Cannot read as ArrayBuffer'));
        }

        resolve(result);
      };

      reader.readAsArrayBuffer(blob);
    }
  );
}
