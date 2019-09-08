export interface SortedMap<K, V> extends Iterable<[K, V]>, Map<K, V> {
  size: number,

  get(key: K): V | undefined,
  has(key: K): boolean,
  set(key: K, value: V): this,
  delete(key: K): boolean,
  clear(): void,

  entries(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<[K, V]>,
  keys(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<K>,
  values(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<V>,
  forEach(
    callback: (value: V, key: K, map: SortedMap<K, V>) => void,
    thisArg?: any,
  ): void,
  [Symbol.iterator](): IterableIterator<[K, V]>,
}

export interface SortedMapConstructor<K, V> {
  new (comparator: (a: K, b: K) => number): SortedMap<K, V>;
}
