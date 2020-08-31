const fs = require('fs');
const path = require('path');
const { getWorkerBody } = require('./get-worker-body');

const endMask = '.worker.js';

const files = fs.readdirSync(path.resolve('src/workers')).filter(file => file.endsWith(endMask));

Promise.all(files.map(async file => [file.substr(0, file.indexOf(endMask)), await getWorkerBody(file)]))
  .then(filesWithUrls =>
    filesWithUrls.reduce(
      (acc, [file, url]) => ({
        ...acc,
        [file]: url
      }),
      {}
    )
  )
  .then(workers => fs.writeFileSync(`${path.resolve('src/workers')}/workers.json`, JSON.stringify(workers)));
