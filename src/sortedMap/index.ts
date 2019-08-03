export interface SortedMap<K, V> {
  get(key: K): V | undefined,
  has(key: K): boolean,
  set(key: K, value: V): void,
  remove(key: K): void,

  forEach(callback: (value: V) => void): void,
  forEachKeys(callback: (key: K) => void): void,
  forEachEntries(callback: (key: K, value: V) => void): void,
}
