import { cacheMake } from './../utils/cache-make';
import { readBlobBuffer } from './../utils/read-blob-buffer';

export class BlobReader {
  private static mementoBuffer: Map<Blob, ArrayBuffer> = cacheMake<
    Blob,
    ArrayBuffer
  >();
  private static memento8Array: Map<Blob, Uint8Array> = cacheMake<
    Blob,
    Uint8Array
  >();

  static readBuffer(blob: Blob): Promise<ArrayBuffer> {
    if (BlobReader.mementoBuffer.has(blob)) {
      return Promise.resolve(BlobReader.mementoBuffer.get(blob) as ArrayBuffer);
    }

    return readBlobBuffer(blob).then(
      (buffer: ArrayBuffer): ArrayBuffer => {
        BlobReader.mementoBuffer.set(blob, buffer);

        return buffer;
      }
    );
  }

  static read8Array(blob: Blob): Promise<Uint8Array> {
    if (!Uint8Array) {
      return Promise.reject(new TypeError('Uint8Array unavailable'));
    }

    if (BlobReader.memento8Array.has(blob)) {
      return Promise.resolve(BlobReader.memento8Array.get(blob) as Uint8Array);
    }

    return BlobReader.readBuffer(blob).then(
      (buffer: ArrayBuffer): Uint8Array => {
        const array = new Uint8Array(buffer);

        BlobReader.memento8Array.set(blob, array);

        return array;
      }
    );
  }
}
