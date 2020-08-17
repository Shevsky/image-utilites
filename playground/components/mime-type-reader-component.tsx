import classNames from 'classnames';
import { FilePreview } from './file-preview';
import { MIME_TYPE, MimeTypeReader } from 'image-utilites';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import './mime-type-reader-component.sass';

export function MimeTypeReaderComponent(): JSX.Element {
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

  const [result, setResult] = useState<MIME_TYPE | void>(void 0);
  useEffect((): void => {
    if (!file) {
      setLoading(false);
      return;
    }

    const startTime = new Date().getTime();

    MimeTypeReader.read(file)
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
  }, [file]);

  return (
    <div className="mime-type-reader-component">
      <div className="mime-type-reader-component__file-control">
        <input ref={inputRef} type="file" onChange={handleChangeFile} />
      </div>
      <div>{!!file ? <FilePreview file={file} /> : 'File not selected'}</div>
      {!!file && (
        <div
          className={classNames('mime-type-reader-component__result', {
            ['mime-type-reader-component__result--error']: !!error,
            ['mime-type-reader-component__result--loading']: isLoading,
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
