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

function leftRotate<K, V>(node: Node<K, V>): Node<K, V> {
  //     node                          right
  //    /    \                        /     \
  //   t1   right      -->          node    t4
  //       /     \                 /    \
  //      t23    t4               t1    t23
  let right = node.right;
  let t23 = right.left;
  right.left = node;
  node.right = t23;
  right.depth += 1;
  node.depth -= 1;
  return right;
}

function rightRotate<K, V>(node: Node<K, V>): Node<K, V> {
  //         node                   left
  //        /    \                 /    \
  //      left   t4    -->        t1   node
  //     /    \                       /    \
  //    t1    t23                   t23    t4
  let left = node.left;
  let t23 = left.right;
  left.right = node;
  node.left = t23;
  left.depth += 1;
  node.depth -= 1;
  return left;
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

  _rebalance(node: Node<K, V>): void {
    if (node.right == null || node.left == null) return;
    const diff = node.right.depth - node.left.depth;
    if (diff < -1) {
      // Rotate left
    } else if (diff > 1) {
      // Rotate right
    }
  }

  _set(key: K, value: V, node: Node<K, V>): boolean {
    // Descend down to the node...
    const result = this.comparator(key, node.key);
    if (result === 0) {
      node.value = value;
      return false;
    }
    if (result > 0) {
      // key > current.key
      if (node.right != null) {
        this._set(key, value, node.right);
        node.depth = node.right.depth + 1;
        this._rebalance(node);
      } else {
        node.right = new Node(key, value);
        node.depth += 1;
        return true;
      }
    } else {
      // key < current.key
      if (node.left != null) {
        this._set(key, value, node.left);
        node.depth = node.left.depth + 1;
        this._rebalance(node);
      } else {
        node.left = new Node(key, value);
        node.depth += 1;
        return true;
      }
    }
  }

  set(key: K, value: V): this {
    if (this.root == null) {
      this.root = new Node(key, value);
      this.size += 1;
      return this;
    }
    if (this._set(key, value, this.root)) {
      this.size += 1;
    }
    return this;
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
