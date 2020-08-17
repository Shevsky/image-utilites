import { ComponentType } from 'react';
import { ImageColorTypeReaderComponent } from './../components/image-color-type-reader-component';
import { MimeTypeReaderComponent } from './../components/mime-type-reader-component';

export type TRoute = { component: ComponentType; name: string };

export const Routes: Record<string, TRoute> = {
  '/image-color-type-reader': {
    component: ImageColorTypeReaderComponent,
    name: 'ImageColorTypeReader'
  },
  '/mime-type-reader': {
    component: MimeTypeReaderComponent,
    name: 'MimeTypeReader'
  }
};
