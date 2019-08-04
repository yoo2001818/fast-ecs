import { SortedMap } from './index';

class Node<K, V> {
  key: K;
  value: V;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
  depth: number;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.depth = 0;
  }
}

export default class AVLSortedMap<K, V> implements SortedMap<K, V> {
  comparator: (a: K, b: K) => number;
  size: number = 0;
  root: Node<K, V> | null = null;

  constructor(comparator: (a: K, b: K) => number) {
    this.comparator = comparator;
  }

  get(key: K): V | undefined {
    if (this.root == null) {
      return undefined;
    }
    // Traverse down to the node until the end is met
    let current = this.root;
    while (current != null) {
      const result = this.comparator(key, current.key);
      if (result === 0) return current.value;
      if (result > 0) {
        // key > current.key
        current = current.right;
      } else {
        // key < current.key
        current = current.left;
      }
    }
    return undefined;
  }

  has(key: K): boolean {
    if (this.root == null) {
      return false;
    }
    // Traverse down to the node until the end is met
    let current = this.root;
    while (current != null) {
      const result = this.comparator(key, current.key);
      if (result === 0) return true;
      if (result > 0) {
        current = current.right;
      } else {
        current = current.left;
      }
    }
    return false;
  }

  set(key: K, value: V): this {
    throw new Error("Method not implemented.");
  }

  delete(key: K): boolean {
    throw new Error("Method not implemented.");
  }

  clear(): void {
    this.root = null;
    this.size = 0;
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
