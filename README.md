# Image Utilites
Utilites for working with Blob of image.

## Installation
>npm i image-utilites
>
>yarn add image-utilites

## Playground
https://shevsky.github.io/image-utilites/

## ImageColorTypeReader
Can detect is image is grayscale or colored.

```javascript
import { ImageColorTypeReader } from 'image-utilites';

const imageColorTypeReader = new ImageColorTypeReader();
imageColorTypeReader.read(file).then(colorType => console.log(colorType)); // Don't forget to catch errors!
```

### Configuration
ImageColorTypeReader constructor takes a config object.

Name | Description | Type | Default value
--- | --- | --- | ---
grayscaleThreshold | By default, reader determines is an image is grayscale if red === green === blue. This parameter allows to set the max difference between colors to assume that image is grayscale. | number (0-255) | 0
minifySize | When reader starting to work it will resize source image to width and height not longer that passed value in order to reduce a pixels count. | number | 300

## Result
ImageColorTypeReader returns a promise that resolves `grayscale` or `colored` (enum IMAGE_COLOR_TYPE).

## MimeTypeReader
Can provide mime type of image.

```javascript
import { MimeTypeReader } from 'image-utilites';

MimeTypeReader.read(file).then(mimeType => console.log(mimeType)); // Don't forget to catch errors!
```

## Result
MimeTypeReader returns a promise that resolves `gif`, `jpeg`, `pdf`, `png`, `webp` (enum MIME_TYPE).

