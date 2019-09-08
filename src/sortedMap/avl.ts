import { SortedMap } from './index';

export class Node<K, V> {
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
  // balance factor of X = B(X)
  // height of X = H(X)
  // (next) balance factor of X = Bn(X)
  // (next) height of X = Hn(X)
  // Left rotation changes node height like this:
  // Hn(N.left) = H(N.left)
  // Hn(N.right) = H(R.left)
  // Hn(R.left) = max(H(N.left), H(R.left)) + 1
  // Hn(R.right) = H(R.right)
  // ... B(X) = H(X.right) - H(X.left)
  // Therefore,
  // Bn(N) = Hn(N.right) - Hn(N.left) =
  //   H(R.left) - H(N.left).
  // Bn(R) = Hn(R.right) - Hn(R.left) =
  //   H(R.right) - max(H(N.left), H(R.left)) - 1
  // 
  // Since balance factor is relative, we have to think relatively too -
  // N.left = t1
  // N.right = R
  // R.left = t23
  // R.right = t4
  // B(N) = H(R) - H(t1)
  // B(R) = H(t4) - H(t23)
  // Bn(N) = H(t23) - H(t1)
  // Bn(R) = H(t4) - max(H(t1), H(t23)) - 1
  // 
  // B(N) would be larger than 0 if H(R) is higher than H(t1) (which would be
  // always the case though...)
  // 
  // Relatively, H(N) would decrease by 1 because right node is not there
  // anymore. Therefore, if B(R) < 0, B(N) -= 1. (if t4 is longer, it
  // won't have any effect.) Otherwise, t4 would be longer, and height
  // difference will be B(R). In that case, we actually have to consider
  // difference between B(N) and B(R), and consider H(R) as H(t4) + 1.
  //
  // B(N) = max(H(t4), H(t23)) + 1 - H(t1)
  //   = H(t4) + 1 - H(t1) (if B(R) >= 0)
  // B(R) = H(t4) - H(t23)
  // 
  // Difference between H(t4) and H(t23) can be derived from B(R), and
  // B(N) stores height of H(t4). Using this, we can derive difference between
  // H(t23) and node, and set the actual balance factor.
  // 
  // Bn(N) = B(N) - B(R) - 1.
  //  = B(N) - max(0, B(R)) - 1 in all cases.
  // 
  // How about B(R)? R's left is N now, and we need to calculate the difference
  // between H(N) and H(t23).
  // 
  // Bn(R) = H(t4) - Hn(N)
  //   = H(t4) - max(H(t1), H(t23)) - 1.
  // 
  // Since height of t1, t23, t4 doesn't change, we can use previously
  // calculated Bn(N) to derive this.
  // Bn(N) = H(t23) - H(t1)
  // 
  // B(R) = H(t4) - H(t23), therefore like B(N), other node's balance factor
  // only matters if H(t1) becomes heavier than the other one. 
  //
  // Bn(R) = B(R) - 1 (if Bn(N) >= 0)
  // Otherwise, H(t1) becomes dominant, and we need to update to reflect its
  // height.
  // Bn(R) = H(t4) - H(t23) - (H(t23) - H(t1)) - 1
  //   = B(R) - Bn(N) - 1 (if Bn(N) <= 0)
  // 
  // Therefore....
  // Bn(N) = B(N) - max(0, B(R)) - 1
  // Bn(R) = B(R) - min(0, Bn(N)) - 1
  // 
  node.balanceFactor = node.balanceFactor -
    Math.max(0, right.balanceFactor) - 1;
  right.balanceFactor = right.balanceFactor -
    Math.min(0, node.balanceFactor) - 1;
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
  // B(L) = H(t23) - H(t1)
  // B(N) = H(t4) - H(L)
  //   = H(t4) - max(H(t1), H(t23)) - 1
  // Bn(N) = H(t4) - H(t23)
  //   = | B(N) + 1 (if H(t23) > H(t1), therefore B(L) > 0)
  //     | B(N) + H(t1) - H(t23) + 1 (if B(L) <= 0)
  //       = B(N) - B(L) + 1
  //   = B(N) - min(0, B(L)) + 1
  // Bn(L) = Hn(N) - H(t1)
  //   = B(L) - H(t23) + Hn(N) + 1
  //   = | B(L) - H(t23) + H(t4) + 2 (if H(t4) > H(t23), therefore Bn(N) > 0)
  //       = B(L) + Bn(N) + 1
  //     | B(L) + 1 (if Bn(N) <= 0)
  //   = B(L) - max(0, Bn(N)) + 1
  node.balanceFactor = node.balanceFactor -
    Math.min(0, left.balanceFactor) + 1;
  left.balanceFactor = left.balanceFactor +
    Math.max(0, node.balanceFactor) + 1;
  return left;
}

function rebalance<K, V>(node: Node<K, V>): Node<K, V> {
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

export default class AVLSortedMap<K, V> implements SortedMap<K, V> {
  comparator: (a: K, b: K) => number;
  size: number = 0;
  root: Node<K, V> | null = null;
  _stack: [Node<K, V>, boolean][] = [];

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
    if (this.root == null) {
      this.root = new Node(key, value);
      this.size += 1;
      return this;
    }
    // Descend down to the created node...
    // right = true
    let stack: [Node<K, V>, boolean][] = [];
    let depth = 0;
    {
      let current = this.root;
      while (true) {
        const result = this.comparator(key, current.key);
        if (result === 0) {
          current.value = value;
          return this;
        } else if (result > 0) {
          // key > current.key
          if (current.right != null) {
            current = current.right;
            stack[depth] = [current, true];
            depth += 1;
          } else {
            current.right = new Node(key, value);
            current.balanceFactor += 1;
            this.size += 1;
            break;
          }
        } else if (result < 0) {
          // key < current.key
          if (current.left != null) {
            current = current.left;
            stack[depth] = [current, false];
            depth += 1;
          } else {
            current.left = new Node(key, value);
            current.balanceFactor -= 1;
            this.size += 1;
            break;
          }
        }
      }
    }
    // Then perform a retracing loop.
    while (depth > 0) {
      depth -= 1;
      let item = stack[depth];
      let current = item[0];
      let dir = item[1];
      let parent = depth > 0 ? stack[depth - 1][0] : this.root;
      const newCurrent = rebalance(current);
      if (dir) parent.right = newCurrent;
      else parent.left = newCurrent;
      if (newCurrent.balanceFactor === 0) {
        return this;
      }
      parent.balanceFactor += dir ? 1 : -1;
    }
    this.root = rebalance(this.root);
    return this;
  }

  delete(key: K): boolean {
    if (this.root == null) return false;
    // Descend down to the created node...
    // right = true
    // Since the stack doesn't store root node, we need to store root node
    // separately - root node can be changed while running this.
    let rootNode: Node<K, V> = this.root;
    let stack: [Node<K, V>, boolean][] = [];
    let depth = 0;
    {
      let current: Node<K, V> = this.root;
      while (true) {
        const result = this.comparator(key, current.key);
        if (result === 0) {
          // Node is found - replace the node and retrace.
          this.size -= 1;
          let newTarget: Node<K, V>;
          if (current.left == null && current.right == null) {
            // If the node is empty, simply delete the node.
            newTarget = null;
            // console.log('deleting itself');
          } else if (current.left == null) {
            // If only one side is present, use that node.
            newTarget = current.right;
            // console.log('using right');
          } else if (current.right == null) {
            newTarget = current.left;
            // console.log('using left');
          } else {
            // If both nodes are present, remove leftmost node from right node.
            // This means that we have to traverse down to the bottom of the
            // tree.
            //
            //     a      base depth             d
            //    / \                           / \
            //   f   b    newTarget            f   b
            //      / \                           / \
            //     c   e  newTarget  --->        c   e
            //    /                             /
            //   d        newTarget            g
            //    \
            //     g
            // console.log('descending', depth);
            // console.log(current);
            let baseDepth = depth;
            newTarget = current.right;
            stack[depth] = [newTarget, true];
            depth += 1;
            while (newTarget.left != null) {
              newTarget = newTarget.left;
              stack[depth] = [newTarget, false];
              depth += 1;
            }
            // Since new target will be deleted, replace the target with new 
            // target's right.
            // If new target's right is null, it'll be set to null.
            stack[depth - 1][0] = newTarget.right;
            // Copy left value to here...
            newTarget.left = current.left;
            newTarget.balanceFactor = current.balanceFactor;
            // Then, replace the base depth's node to current node.
            if (baseDepth === 0) {
              rootNode = newTarget;
            } else {
              stack[baseDepth - 1][0] = newTarget;
            }
            break;
          }
          if (depth === 0) {
            rootNode = newTarget;
          } else {
            stack[depth - 1][0] = newTarget;
          }
          break;
        } else if (result > 0) {
          // key > current.key
          if (current.right == null) return false;
          current = current.right;
          stack[depth] = [current, true];
          depth += 1;
        } else {
          // key < current.key
          if (current.left == null) return false;
          current = current.left;
          stack[depth] = [current, false];
          depth += 1;
        }
      }
    }
    // console.log(stack.slice(0, depth).map((v) => [v[0] && v[0].key, v[1]]));
    // Then perform a retracing loop.
    let propagateStopped = false;
    while (depth > 0) {
      depth -= 1;
      let item = stack[depth];
      let current = item[0];
      let dir = item[1];
      let parent = depth > 0 ? stack[depth - 1][0] : rootNode;
      const newCurrent = current != null ? rebalance(current) : null;
      // console.log('rebalance', newCurrent);
      if (dir) parent.right = newCurrent;
      else parent.left = newCurrent;
      if (newCurrent != null && newCurrent.balanceFactor !== 0) {
        // console.log('exit!');
        propagateStopped = true;
      }
      if (!propagateStopped) parent.balanceFactor += dir ? -1 : 1;
    }
    if (rootNode != null) {
      // console.log('rebalance root', rootNode);
      this.root = rebalance(rootNode);
    }
    return true;
  }

  clear(): void {
    this.root = null;
    this.size = 0;
  }

  *entries(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<[K, V]> {
    // Stack only stores reentry nodes.
    let stack: Node<K, V>[] = [];
    if (start !== undefined) {
      // Try to locate the target node.
      // If locating 1 - 
      // here      here if after is true
      // v         v
      // 1 1 1 1 1 2 2 2 
      // In the ordered set, they must reside in same parent, therefore we just
      // have to go to leftmost same value node when the node is found.
      // If after is specified, go to rightmost same value + 1 when the node
      // is found?
    }
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
  *keys(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<K> {
    let entries = this.entries(start, after, reversed);
    while (true) {
      let { done, value } = entries.next();
      if (done) break;
      yield value[0];
    }
  }
  *values(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<V> {
    let entries = this.entries(start, after, reversed);
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
  get [Symbol.toStringTag](): string {
    return 'AVLSortedMap';
  }

}
