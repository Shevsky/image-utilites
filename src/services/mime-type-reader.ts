import { cacheMake } from './../utils/cache-make';
import { BlobReader } from './blob-reader';

export enum MIME_TYPE {
  GIF = 'gif',
  JPEG = 'jpeg',
  PDF = 'pdf',
  PNG = 'png',
  WEBP = 'webp',
}

const HEADER_MIME_TYPE_MAP: Record<string, MIME_TYPE> = {
  25504446: MIME_TYPE.PDF,
  52494646: MIME_TYPE.WEBP,
  '89504e47': MIME_TYPE.PNG,
  47494638: MIME_TYPE.GIF,
  ffd8ffdb: MIME_TYPE.JPEG,
  ffd8ffe0: MIME_TYPE.JPEG,
  ffd8ffe1: MIME_TYPE.JPEG,
  ffd8ffe2: MIME_TYPE.JPEG,
  ffd8ffe3: MIME_TYPE.JPEG,
  ffd8ffe8: MIME_TYPE.JPEG,
  ffd8ffee: MIME_TYPE.JPEG,
};

const HEADER_BYTES_FROM = 0;
const HEADER_BYTES_TO = 4;
const HEADER_RADIX = 16;

export class MimeTypeReader {
  private static memento: Map<Blob, MIME_TYPE> = cacheMake<Blob, MIME_TYPE>();

  static read(blob: Blob): Promise<MIME_TYPE> {
    if (MimeTypeReader.memento.has(blob)) {
      return Promise.resolve(MimeTypeReader.memento.get(blob) as MIME_TYPE);
    }

    return BlobReader.read8Array(blob)
      .then((array: Uint8Array): string => {
        const subarray = array.subarray(HEADER_BYTES_FROM, HEADER_BYTES_TO);

        return subarray.reduce(
          (acc: string, item: number): string =>
            acc + item.toString(HEADER_RADIX),
          ''
        );
      })
      .then((header: string): Promise<never> | MIME_TYPE => {
        if (!(header in HEADER_MIME_TYPE_MAP)) {
          return Promise.reject(new Error('Unknown mime type'));
        }

        const mimeType = HEADER_MIME_TYPE_MAP[header];

        MimeTypeReader.memento.set(blob, mimeType);

        return mimeType;
      });
  }
}
