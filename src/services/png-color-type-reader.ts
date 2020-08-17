import { cacheMake } from './../utils/cache-make';
import { BlobReader } from './blob-reader';
import { MIME_TYPE, MimeTypeReader } from './mime-type-reader';

export enum PNG_COLOR_TYPE {
  GRAYSCALE = 'grayscale',
  RGB = 'rgb',
  PLTE = 'plte',
  GRAYSCALE_ALPHA = 'grayscale_alpha',
  RGB_ALPHA = 'rgb_alpha',
}

const HEADER_COLOR_TYPE_MAP: Record<number, PNG_COLOR_TYPE> = {
  0: PNG_COLOR_TYPE.GRAYSCALE,
  2: PNG_COLOR_TYPE.RGB,
  3: PNG_COLOR_TYPE.PLTE,
  4: PNG_COLOR_TYPE.GRAYSCALE_ALPHA,
  6: PNG_COLOR_TYPE.RGB_ALPHA,
};

const HEADER_BYTES_FROM = 25;
const HEADER_BYTES_TO = 26;

export class PngColorTypeReader {
  private static memento: Map<Blob, PNG_COLOR_TYPE> = cacheMake<
    Blob,
    PNG_COLOR_TYPE
  >();

  static read(blob: Blob): Promise<PNG_COLOR_TYPE> {
    if (PngColorTypeReader.memento.has(blob)) {
      return Promise.resolve(
        PngColorTypeReader.memento.get(blob) as PNG_COLOR_TYPE
      );
    }

    return MimeTypeReader.read(blob)
      .then((mimeType: MIME_TYPE): Promise<never> | void => {
        if (mimeType !== MIME_TYPE.PNG) {
          return Promise.reject(new Error('Not png file'));
        }
      })
      .then((): Promise<Uint8Array> => BlobReader.read8Array(blob))
      .then((array: Uint8Array): number => {
        const subarray = array.subarray(HEADER_BYTES_FROM, HEADER_BYTES_TO);

        return subarray[0];
      })
      .then((byte: number): Promise<never> | PNG_COLOR_TYPE => {
        if (!(byte in HEADER_COLOR_TYPE_MAP)) {
          return Promise.reject('Unknown color type');
        }

        const colorType = HEADER_COLOR_TYPE_MAP[byte];

        PngColorTypeReader.memento.set(blob, colorType);

        return colorType;
      });
  }
}
