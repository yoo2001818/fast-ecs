import { SortedMap } from './index';

export default class AVLSortedMap<K, V> implements SortedMap<K, V> {
  size: number;

  constructor(comparator: (a: K, b: K) => number) {
    
  }


  get(key: K): V {
    throw new Error("Method not implemented.");
  }
  has(key: K): boolean {
    throw new Error("Method not implemented.");
  }
  set(key: K, value: V): this {
    throw new Error("Method not implemented.");
  }
  delete(key: K): boolean {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
  entries(): IterableIterator<[K, V]> {
    throw new Error("Method not implemented.");
  }
  keys(): IterableIterator<K> {
    throw new Error("Method not implemented.");
  }
  values(): IterableIterator<V> {
    throw new Error("Method not implemented.");
  }
  forEach(callback: (value: V, key: K, map: SortedMap<K, V>) => void, thisArg?: any): void {
    throw new Error("Method not implemented.");
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    throw new Error("Method not implemented.");
  }
  [Symbol.toStringTag]: string;

}
