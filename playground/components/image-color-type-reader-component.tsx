import classNames from 'classnames';
import {
  IMAGE_COLOR_TYPE,
  ImageColorTypeReader,
  TImageColorTypeReaderConfig,
} from 'image-utilites';
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { FilePreview } from './file-preview';
import './image-color-type-reader-component.sass';

export function ImageColorTypeReaderComponent(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | void>(void 0);
  const [time, setTime] = useState<number | void>(void 0);

  const reset = useCallback((): void => {
    setLoading(true);
    setError(void 0);
    setTime(void 0);
    setFile(void 0);
  }, []);

  const [file, setFile] = useState<File | void>(void 0);
  const handleChangeFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      reset();

      if (!event?.target?.files?.length) {
        return setFile(void 0);
      }

      setFile(event.target.files[0]);
    },
    []
  );

  const [config, setConfig] = useState<TImageColorTypeReaderConfig>({
    minifySize: 300,
  });
  const handleChangeConfig = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const {
        target: {
          dataset: { type },
          name,
          value,
        },
      } = event;
      const nextValue = type === 'number' ? Number(value) || 0 : value;

      reset();
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      setConfig({
        ...config,
        [name]: nextValue,
      });
    },
    [config]
  );

  const imageColorTypeReader = useMemo(
    (): ImageColorTypeReader => new ImageColorTypeReader(config),
    [config]
  );

  const [result, setResult] = useState<IMAGE_COLOR_TYPE | void>(void 0);
  useEffect((): void => {
    if (!file) {
      setLoading(false);
      return;
    }

    const startTime = new Date().getTime();

    imageColorTypeReader
      .read(file)
      .then(setResult)
      .catch((error: Error): void => {
        setResult(void 0);
        setError(error);
      })
      .finally((): void => {
        const endTime = new Date().getTime();
        setTime((endTime - startTime) / 1000);

        setLoading(false);
      });
  }, [file, imageColorTypeReader]);

  return (
    <div className="image-color-type-reader-component">
      <div className="image-color-type-reader-component__config">
        <div className="image-color-type-reader-component__config-item">
          <div className="image-color-type-reader-component__config-item-label">
            chunkSize
          </div>
          <div className="image-color-type-reader-component__config-item-control">
            <input
              data-type="number"
              name="chunkSize"
              type="text"
              value={config.chunkSize ?? ''}
              onChange={handleChangeConfig}
            />
          </div>
        </div>
        <div className="image-color-type-reader-component__config-item">
          <div className="image-color-type-reader-component__config-item-label">
            grayscaleThreshold
          </div>
          <div className="image-color-type-reader-component__config-item-control">
            <input
              data-type="number"
              name="grayscaleThreshold"
              type="text"
              value={config.grayscaleThreshold ?? ''}
              onChange={handleChangeConfig}
            />
          </div>
        </div>
        <div className="image-color-type-reader-component__config-item">
          <div className="image-color-type-reader-component__config-item-label">
            minifySize
          </div>
          <div className="image-color-type-reader-component__config-item-control">
            <input
              data-type="number"
              name="minifySize"
              type="text"
              value={config.minifySize ?? ''}
              onChange={handleChangeConfig}
            />
          </div>
        </div>
      </div>
      <div className="image-color-type-reader-component__file-control">
        <input ref={inputRef} type="file" onChange={handleChangeFile} />
      </div>
      <div>{!!file ? <FilePreview file={file} /> : 'File not selected'}</div>
      {!!file && (
        <div
          className={classNames('image-color-type-reader-component__result', {
            ['image-color-type-reader-component__result--error']: !!error,
            ['image-color-type-reader-component__result--loading']: isLoading,
          })}
        >
          {isLoading ? (
            'Loading...'
          ) : result ? (
            <div>
              <div>
                <b>Result:</b> {result}
              </div>
              <div>
                <b>Time:</b> {time ? `${time.toFixed(3)} sec.` : 'unknown'}
              </div>
            </div>
          ) : error ? (
            error.message
          ) : (
            'UNKNOWN RESULT'
          )}
        </div>
      )}
    </div>
  );
}
