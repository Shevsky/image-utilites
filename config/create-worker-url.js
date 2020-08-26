const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function createWorkerUrl(name) {
  const worker = `${path.resolve('src/workers')}/${name}`;

  let response = fs.readFileSync(worker).toString();
  if (process.env.NODE_ENV === 'prod') {
    response = await minify(response, {
      sourceMap: false
    }).then(output => output.code);
  }

  return `data:application/javascript;base64,${Buffer.from(response).toString('base64')}`;
}

module.exports = { createWorkerUrl };
