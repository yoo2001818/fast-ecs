import { SortedMap } from './index';

export class Node<K, V> {
  key: K;
  value: V;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
  isRed: boolean;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.isRed = false;
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
  return left;
}

export default class RedBlackSortedMap<K, V> implements SortedMap<K, V> {
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
      // If root is null, it's trivial - The root node is black and it's done.
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
            current.isRed = true;
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
            current.isRed = true;
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
      const newCurrent = current;
      // 1. If parent's color is black, do nothing as it's a valid tree.
      // 2. If grandparent's other child (i.e. uncle) is black,
      //    set parent, uncle to red, and set grandparent to red.
      if (dir) parent.right = newCurrent;
      else parent.left = newCurrent;
    }
    // Set root node to black if it's not black.
    this.root = this.root;
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
    let skipNext = after;
    if (start !== undefined) {
      // Try to locate the target node.
      // If after is specified, go to rightmost same value + 1 when the node
      // is found?
      // Traverse down to the node until the end is met
      let current = this.root;
      while (current != null) {
        const result = this.comparator(start, current.key);
        if (result === 0) {
          // Start from here...
          stack.push(current);
          break;
        } else if (result > 0) {
          // key > current.key
          // When going right, don't push stack.
          if (reversed) {
            stack.push(current);
          }
          current = current.right;
        } else {
          // key < current.key
          if (!reversed) {
            // Push to stack when going left...
            stack.push(current);
          }
          current = current.left;
        }
      }
    } else {
      // For that reason, we need to descend down to the leftmost node.
      if (!reversed) {
        let current = this.root;
        stack.push(current);
        while (current.left != null) {
          stack.push(current.left);
          current = current.left;
        }
      } else {
        let current = this.root;
        stack.push(current);
        while (current.right != null) {
          stack.push(current.right);
          current = current.right;
        }
      }
    }
    while (stack.length > 0) {
      let node = stack.pop();
      if (!skipNext) {
        yield [node.key, node.value];
      } else {
        skipNext = false;
      }
      if (!reversed) {
        if (node.right != null) {
          let current = node.right;
          stack.push(current);
          while (current.left != null) {
            stack.push(current.left);
            current = current.left;
          }
        }
      } else {
        if (node.left != null) {
          let current = node.left;
          stack.push(current);
          while (current.right != null) {
            stack.push(current.right);
            current = current.right;
          }
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
