export function cacheMake<K, V>(): Map<K, V> {
  if (!Map) {
    throw new TypeError('Map unavailable');
  }

  return new Map<K, V>();
}
