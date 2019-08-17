import { SortedMap } from './index';

class Node<K, V> {
  key: K;
  value: V;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
  balanceFactor: number;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.balanceFactor = 0;
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
  // If right balance factor is >0, it means t4 is longer
  // If right balance factor is <0, it means t23 is longer
  // If node balance factor is <0, or 0, it means t1 is longer
  //
  // Considering this, we can build a formula to recalculate balance factor:
  // balance factor of X = B(X)
  // B(node) = B(node) - 1 - B(right)
  // B(right) = B(right) - 1
  node.balanceFactor = node.balanceFactor - 1 - right.balanceFactor;
  right.balanceFactor = right.balanceFactor - 1;
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
  // If left balance factor is <0, it means t1 is longer
  // If left balance factor is >0, it means t23 is longer
  // If node balance factor is >0, or 0, it means t4 is longer
  //
  // Considering this, we can build a formula to recalculate balance factor:
  // balance factor of X = B(X)
  // B(node) = B(node) + 1 - B(left)
  // B(left) = B(left) + 1
  node.balanceFactor = node.balanceFactor + 1 - left.balanceFactor;
  left.balanceFactor = left.balanceFactor + 1;
  return left;
}

function min<K, V>(node: Node<K, V>): Node<K, V> {
  let current = node;
  while (current.left != null) current = current.left;
  return current;
}

function max<K, V>(node: Node<K, V>): Node<K, V> {
  let current = node;
  while (current.right != null) current = current.right;
  return current;
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

  _rebalance(node: Node<K, V>): Node<K, V> {
    if (node.balanceFactor < -1) {
      if (node.left != null && node.left.balanceFactor >= 1) {
        node.left = leftRotate(node.left);
      }
      return rightRotate(node);
    } else if (node.balanceFactor > 1) {
      if (node.right != null && node.right.balanceFactor <= -1) {
        node.right = rightRotate(node.right);
      }
      return leftRotate(node);
    }
    return node;
  }

  _set(key: K, value: V, node: Node<K, V>): Node<K, V> {
    // Descend down to the node...
    const result = this.comparator(key, node.key);
    if (result === 0) {
      node.value = value;
      return node;
    }
    if (result > 0) {
      // key > current.key
      if (node.right != null) {
        node.right = this._set(key, value, node.right);
        node.balanceFactor += 1;
        return this._rebalance(node);
      } else {
        node.right = new Node(key, value);
        node.balanceFactor += 1;
        this.size += 1;
        return node;
      }
    } else {
      // key < current.key
      if (node.left != null) {
        node.left = this._set(key, value, node.left);
        node.balanceFactor -= 1;
        return this._rebalance(node);
      } else {
        node.left = new Node(key, value);
        node.balanceFactor -= 1;
        this.size += 1;
        return node;
      }
    }
  }

  set(key: K, value: V): this {
    if (this.root == null) {
      this.root = new Node(key, value);
      this.size += 1;
      return this;
    }
    this.root = this._set(key, value, this.root);
    return this;
  }

  _delete(key: K, node: Node<K, V>): [boolean, Node<K, V> | null] {
    // Descend down to the node...
    const result = this.comparator(key, node.key);
    if (result === 0) {
      // Node is found - replace the node and retrace.
      if (node.left == null && node.right == null) {
        // If the node is empty, simply delete the node.
        this.size -= 1;
        return [true, null];
      } else if (node.left == null) {
        // If the node has only one child, use other one.
        this.size -= 1;
        return [true, node.right];
      } else if (node.right == null) {
        this.size -= 1;
        return [true, node.left];
      } else {
        // If both nodes are present, remove leftmost node from right node.
        // TODO rebalance
        let leftmostParent = node;
        let leftmost = node.right;
        while (leftmost.left != null) {
          leftmostParent = leftmost;
          leftmost.balanceFactor += 1;
          leftmost = leftmost.left;
          // TODO Rebalance
        }
        if (leftmostParent === node) {
          leftmostParent.right = null;
        } else {
          // If leftmost node has right node, replace parent's left node with
          // it.
          leftmostParent.left = leftmost.right;
        }
        // Replace the node in place...
        leftmost.left = node.left;
        leftmost.right = node.right;
        leftmost.balanceFactor = node.balanceFactor - 1;
        this.size -= 1;
        return [true, leftmost];
      }
    } else if (result > 0) {
      // key > current.key
      if (node.right == null) {
        return [false, node];
      }
      const result = this._delete(key, node.right);
      if (result[0]) {
        node.right = result[1];
        node.balanceFactor -= 1;
        return [true, this._rebalance(node)];
      } else {
        return [false, node];
      }
    } else {
      // key < current.key
      if (node.left == null) {
        return [false, node];
      }
      const result = this._delete(key, node.left);
      if (result[0]) {
        node.left = result[1];
        node.balanceFactor += 1;
        return [true, this._rebalance(node)];
      } else {
        return [false, node];
      }
    }
  }

  delete(key: K): boolean {
    if (this.root == null) return false;
    const result = this._delete(key, this.root);
    this.root = result[1];
    return result[0];
  }

  clear(): void {
    this.root = null;
    this.size = 0;
  }

  *entries(): IterableIterator<[K, V]> {
    // Stack only stores reentry nodes.
    let stack: Node<K, V>[] = [];
    // For that reason, we need to descend down to the leftmost node.
    {
      let current = this.root;
      stack.push(current);
      while (current.left != null) {
        stack.push(current.left);
        current = current.left;
      }
    }
    while (stack.length > 0) {
      let node = stack.pop();
      yield [node.key, node.value];
      if (node.right != null) {
        let current = node.right;
        stack.push(current);
        while (current.left != null) {
          stack.push(current.left);
          current = current.left;
        }
      }
    }
  }
  *keys(): IterableIterator<K> {
    let entries = this.entries();
    while (true) {
      let { done, value } = entries.next();
      if (done) break;
      yield value[0];
    }
  }
  *values(): IterableIterator<V> {
    let entries = this.entries();
    while (true) {
      let { done, value } = entries.next();
      if (done) break;
      yield value[1];
    }
  }
  forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void {
    let entries = this.entries();
    while (true) {
      let { done, value } = entries.next();
      if (done) break;
      callback.call(thisArg, value[1], value[0], this);
    }
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
  [Symbol.toStringTag]: string;

}
