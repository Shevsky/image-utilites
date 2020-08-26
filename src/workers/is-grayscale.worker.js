/**
 * @param {string} message.data.id
 * @param {ArrayBuffer} message.data.buffer
 * @param {number} message.data.threshold
 */
self.onmessage = function(message) {
  const payload = message.data;

  const data = new Uint8Array(payload.buffer);
  const length = data.length;

  let result = true;
  for (let i = 0; i < length; i += 4) {
    if (!isGrayscale(data[i], data[i + 1], data[i + 2], payload.threshold)) {
      result = false;
      break;
    }
  }

  resolve(payload.id, result);
};

/**
 * @param {string} id
 * @param {boolean} result
 */
function resolve(id, result) {
  self.postMessage({ id, result }, []);
}

/**
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {number} threshold
 * @return {boolean}
 */
function isGrayscale(red, green, blue, threshold) {
  const isFullyGrayscale = red === green && green === blue;

  if (!threshold || isFullyGrayscale) {
    return isFullyGrayscale;
  }

  return Math.abs(red - green) <= threshold && Math.abs(green - blue) <= threshold && Math.abs(red - blue) <= threshold;
}
