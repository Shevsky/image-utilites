export function cacheMake<K, V>(): Map<K, V> | undefined {
  if (!Map) {
    return void 0;
  }

  return new Map<K, V>();
}
