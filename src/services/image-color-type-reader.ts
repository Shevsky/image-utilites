import { WorkerPort } from './../workers/worker-port';
import { cacheMake } from './../utils/cache-make';
import { PNG_COLOR_TYPE, PngColorTypeReader } from './png-color-type-reader';

export enum IMAGE_COLOR_TYPE {
  GRAYSCALE = 'grayscale',
  COLORED = 'colored'
}

const PNG_COLOR_TYPE_IMAGE_COLOR_TYPE_MAP: Partial<Record<PNG_COLOR_TYPE, IMAGE_COLOR_TYPE>> = {
  [PNG_COLOR_TYPE.GRAYSCALE]: IMAGE_COLOR_TYPE.GRAYSCALE,
  [PNG_COLOR_TYPE.GRAYSCALE_ALPHA]: IMAGE_COLOR_TYPE.GRAYSCALE
};

type TImageSize = {
  minified: [number, number];
  natural: [number, number];
};

export type TImageColorTypeReaderConfig = {
  grayscaleThreshold?: number;
  minifySize?: number;
};

const IMAGE_READER_DEFAULT_CONFIG: Required<TImageColorTypeReaderConfig> = {
  grayscaleThreshold: 0,
  minifySize: 300
};

export class ImageColorTypeReader {
  private static iterationId: number = 0;

  private readonly config: Required<TImageColorTypeReaderConfig>;
  private memento: Map<Blob, IMAGE_COLOR_TYPE> = cacheMake<Blob, IMAGE_COLOR_TYPE>();

  constructor(config: TImageColorTypeReaderConfig = {}) {
    this.config = { ...IMAGE_READER_DEFAULT_CONFIG, ...config };
  }

  get iterationId(): string {
    return ImageColorTypeReader.iterationId.toString();
  }

  read(blob: Blob): Promise<IMAGE_COLOR_TYPE> {
    if (this.memento.has(blob)) {
      return Promise.resolve(this.memento.get(blob) as IMAGE_COLOR_TYPE);
    }

    ImageColorTypeReader.iterationId++;

    return PngColorTypeReader.read(blob)
      .then((pngColorType: PNG_COLOR_TYPE): Promise<never> | IMAGE_COLOR_TYPE => {
        if (!(pngColorType in PNG_COLOR_TYPE_IMAGE_COLOR_TYPE_MAP)) {
          return Promise.reject();
        }

        return PNG_COLOR_TYPE_IMAGE_COLOR_TYPE_MAP[pngColorType] as IMAGE_COLOR_TYPE;
      })
      .catch((): Promise<IMAGE_COLOR_TYPE> => this.detectColorType(blob))
      .then(
        (colorType: IMAGE_COLOR_TYPE): IMAGE_COLOR_TYPE => {
          this.memento.set(blob, colorType);

          return colorType;
        }
      );
  }

  private minifySize(width: number, height: number): [number, number] {
    if (this.config.minifySize === void 0) {
      return [width, height];
    }

    if (width < this.config.minifySize && height < this.config.minifySize) {
      return [width, height];
    }

    return this.minifySize(width * 0.75, height * 0.75);
  }

  private getSize(image: HTMLImageElement): TImageSize {
    if (!image.naturalHeight || !image.naturalHeight) {
      return {
        minified: [0, 0],
        natural: [0, 0]
      };
    }

    const { naturalHeight, naturalWidth } = image;

    return {
      minified: this.minifySize(naturalWidth, naturalHeight).map(Math.ceil) as [number, number],
      natural: [naturalWidth, naturalHeight]
    };
  }

  private detectColorType(blob: Blob): Promise<IMAGE_COLOR_TYPE> {
    if (!URL) {
      return Promise.reject(new Error('URL unavailable'));
    }

    if (!Worker) {
      return Promise.reject(new Error('Worker unavailable'));
    }

    let workerPort: WorkerPort;
    try {
      workerPort = WorkerPort.make('is-grayscale');
    } catch (e) {
      return Promise.reject(e);
    }

    return new Promise((resolve: (colorType: IMAGE_COLOR_TYPE) => void, reject: (error: Error) => void): void => {
      const image = new Image();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        return reject(new TypeError('2d context of canvas is unavailable'));
      }

      image.onerror = (): void => reject(new Error('Cannot load image'));
      image.onload = (): void => {
        const {
          minified: [width, height],
          natural: [naturalWidth, naturalHeight]
        } = this.getSize(image);
        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, 0, 0, naturalWidth, naturalHeight, 0, 0, width, height);

        const imageData = context.getImageData(0, 0, width, height);
        if (!imageData.data || !imageData.data.buffer) {
          return reject(new TypeError('Cannot read image data'));
        }

        const buffer = imageData.data.buffer;

        workerPort.subscribe(this.iterationId, (data: any): void =>
          resolve(data.result ? IMAGE_COLOR_TYPE.GRAYSCALE : IMAGE_COLOR_TYPE.COLORED)
        );

        const message = {
          id: this.iterationId,
          buffer,
          threshold: this.config.grayscaleThreshold
        };

        workerPort.post(message, [buffer]);
      };

      image.src = URL.createObjectURL(blob);
    });
  }
}
