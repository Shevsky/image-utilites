import React, { useMemo } from 'react';
import './file-preview.sass';

type TFilePreviewProps = {
  file: File;
};

export function FilePreview(props: TFilePreviewProps): JSX.Element {
  const url = useMemo((): string => URL.createObjectURL(props.file), [
    props.file,
  ]);

  return (
    <div className="file-preview">
      <div className="file-preview__info">
        <div>
          <b>File name:</b> {props.file.name}
        </div>
        <div>
          <b>File type:</b> {props.file.type}
        </div>
        <div>
          <b>File size:</b> {props.file.size}
        </div>
      </div>

      <div className="file-preview__image-wrapper">
        <img className="file-preview__image" src={url} />
      </div>
    </div>
  );
}
