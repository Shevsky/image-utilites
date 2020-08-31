export function createWorkerBlobUrl(body: string): string {
  if (!URL) {
    throw new TypeError('URL unavailable');
  }

  const blob = new Blob([body], { type: 'application/javascript' });

  return URL.createObjectURL(blob);
}
