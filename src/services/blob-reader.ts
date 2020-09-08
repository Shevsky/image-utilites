import { cacheMake } from './../utils/cache-make';
import { readBlobBuffer } from './../utils/read-blob-buffer';

const CHUNK_8_ARRAY_BYTES_FROM = 0;
const CHUNK_8_ARRAY_BYTES_TO = 26;

const HEADER_BYTES_FROM = 0;
const HEADER_BYTES_TO = 4;
const HEADER_RADIX = 16;

export class BlobReader {
  private static memento8Array?: Map<Blob, Uint8Array> = cacheMake<Blob, Uint8Array>();
  private static mementoHeader?: Map<Blob, string> = cacheMake<Blob, string>();

  static read8Array(blob: Blob, fully?: boolean): Promise<Uint8Array> {
    if (!Uint8Array) {
      return Promise.reject(new TypeError('Uint8Array unavailable'));
    }

    if (!fully && BlobReader.memento8Array?.has(blob)) {
      return Promise.resolve(BlobReader.memento8Array.get(blob) as Uint8Array);
    }

    return readBlobBuffer(blob)
      .then((buffer: ArrayBuffer): Uint8Array => new Uint8Array(buffer))
      .then(
        (array: Uint8Array): Uint8Array => {
          if (fully) {
            return array;
          }

          return array.subarray(CHUNK_8_ARRAY_BYTES_FROM, CHUNK_8_ARRAY_BYTES_TO);
        }
      )
      .then(
        (array: Uint8Array): Uint8Array => {
          if (!fully) {
            BlobReader.memento8Array?.set(blob, array);
          }

          return array;
        }
      );
  }

  static readHeader(blob: Blob): Promise<string> {
    if (BlobReader.mementoHeader?.has(blob)) {
      return Promise.resolve(BlobReader.mementoHeader.get(blob) as string);
    }

    return BlobReader.read8Array(blob)
      .then((array: Uint8Array): string => {
        const subarray = array.subarray(HEADER_BYTES_FROM, HEADER_BYTES_TO);

        return subarray.reduce((acc: string, item: number): string => acc + item.toString(HEADER_RADIX), '');
      })
      .then((header: string): string => {
        BlobReader.mementoHeader?.set(blob, header);

        return header;
      });
  }
}
