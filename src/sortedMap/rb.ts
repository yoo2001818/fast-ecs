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
    let prevDir = false;
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
            current.right.isRed = true;
            this.size += 1;
            prevDir = true;
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
            current.left.isRed = true;
            this.size += 1;
            prevDir = false;
            break;
          }
        }
      }
    }
    // Then perform a retracing loop.
    depth -= 1;
    while (depth >= 0) {
      let item = stack[depth];
      let current = item[0];
      let dir = item[1];
      let parentItem = depth > 0 ? stack[depth - 1] : null;
      let parent = depth > 0 ? parentItem[0] : this.root;
      let parentDir = depth > 0 ? parentItem[1] : false;
      // If node's color is black, do nothing as it's a valid tree.
      // If node's color is red, property 4 is violated - if a node is red,
      //   its children must be all black.
      // Read the parent's other child (i.e. sibling) node's color.
      // 1. If sibling node is red, both sibling and current node's color can be
      //    repainted to black, and parent's color can be red.
      //    However, grandparent's color can be red too - to resolve
      //    this, repeat the validation for the grandparent.
      // 2. If sibling node is black, we have to rotate the tree to make node 
      //    to become parent (rotate right if the node is on left side,
      //    and vice versa.) However, this does not work if the child node 
      //    is already occupying that side. If that's the case, rotate
      //    child node / current node to make it linear.
      //    Then, rotate current node / parent node to fit current node into
      //    parent's position, and repaint current node to black,
      //    parent node to red. Since the current node's color is black, no more
      //    validation is necessary.
      
      // Do nothing if the node's color is black.
      if (!current.isRed) break;

      let sibling = dir ? parent.left : parent.right;
      if (sibling != null && sibling.isRed) {
        // Repaint the node, and decrease the depth (to validate grandparent)
        current.isRed = false;
        sibling.isRed = false;
        parent.isRed = true;
        depth -= 2;
        prevDir = parentDir;
      } else {
        // If the node is using left side, and its right side is occupied,
        // rotate right. (and vice versa)
        if (!dir && prevDir) {
          current = leftRotate(current);
          parent.left = current;
        } else if (dir && !prevDir) {
          current = rightRotate(current);
          parent.right = current;
        }
        // Swap the node and parent's offset by rotating left / right.
        current.isRed = false;
        parent.isRed = true;
        if (!dir) {
          parent = rightRotate(parent);
        } else {
          parent = leftRotate(parent);
        }
        // Ascend the stack and try to set the parent's parent...
        if (depth > 0) {
          let grandparent;
          if (depth > 1) {
            grandparent = stack[depth - 2][0];
          } else {
            grandparent = this.root;
          }
          if (parentDir) {
            grandparent.right = parent;
          } else {
            grandparent.left = parent;
          }
        } else {
          this.root = parent;
        }
        break;
      }
    }
    // Set root node to black if it's not black.
    if (this.root.isRed) this.root.isRed = false;
    return this;
  }

  delete(key: K): boolean {
    throw new Error('Not implemented');
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
