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

  _deleteDescend(node: Node<K, V>): [boolean, Node<K, V>, Node<K, V>] {
    if (node.left == null) {
      return [true, null, node];
    }
    let result = this._deleteDescend(node.left);
    if (result[0]) {
      node.left = result[1];
      node.balanceFactor += 1;
      const balanceResult = rebalance(node);
      // If balance factor becomes 0, it means the height decreasing has
      // actually occurred and propagation is necessary to the parent.
      return [balanceResult.balanceFactor === 0, balanceResult, result[2]];
    } else {
      return [false, node, result[2]];
    }
  }

  // First boolean means if the deletion happened,
  // second boolean means if node's height has been changed.
  _delete(key: K, node: Node<K, V>): [boolean, boolean, Node<K, V> | null] {
    // Descend down to the node...
    const result = this.comparator(key, node.key);
    if (result === 0) {
      // Node is found - replace the node and retrace.
      this.size -= 1;
      if (node.left == null && node.right == null) {
        // If the node is empty, simply delete the node.
        return [true, true, null];
      } else if (node.left == null) {
        // If the node has only one child, use other one.
        return [true, true, node.right];
      } else if (node.right == null) {
        return [true, true, node.left];
      } else {
        // If both nodes are present, remove leftmost node from right node.
        const deleteResult = this._deleteDescend(node.right);
        const newNode = deleteResult[2];
        newNode.left = node.left;
        newNode.right = deleteResult[1];
        newNode.balanceFactor = node.balanceFactor -
          (deleteResult[0] ? 1 : 0);
        const balanceResult = rebalance(newNode);
        // If balance factor becomes 0, it means the height decreasing has
        // actually occurred and propagation is necessary to the parent.
        return [true, balanceResult.balanceFactor === 0, balanceResult];
      }
    } else if (result > 0) {
      // key > current.key
      if (node.right == null) {
        return [false, false, node];
      }
      const result = this._delete(key, node.right);
      node.right = result[2];
      if (result[1]) {
        node.balanceFactor -= 1;
        if (node.balanceFactor === -1) {
          // Height decrease is absorbed at this node.
          //    2            2
          //   / \    -->   /
          //  1  3         1
          return [result[0], false, node];
        }
        const balanceResult = rebalance(node);
        // If balance factor becomes 0, it means the height decreasing has
        // actually occurred and propagation is necessary to the parent.
        return [result[0], balanceResult.balanceFactor === 0, balanceResult];
      } else {
        return [result[0], false, node];
      }
    } else {
      // key < current.key
      if (node.left == null) {
        return [false, false, node];
      }
      const result = this._delete(key, node.left);
      node.left = result[2];
      if (result[1]) {
        node.balanceFactor += 1;
        if (node.balanceFactor === 1) {
          // Height decrease is absorbed at this node.
          //    2            2
          //   / \    -->     \
          //  1  3            3
          return [result[0], false, node];
        }
        const balanceResult = rebalance(node);
        // If balance factor becomes 0, it means the height decreasing has
        // actually occurred and propagation is necessary to the parent.
        return [result[0], balanceResult.balanceFactor === 0, balanceResult];
      } else {
        return [result[0], false, node];
      }
    }
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
      let parent: Node<K, V> = null;
      // right = true
      let parentDir: boolean = false;
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
            console.log('deleting itself');
          } else if (current.left == null) {
            // If only one side is present, use that node.
            newTarget = current.right;
            console.log('using right');
          } else if (current.right == null) {
            newTarget = current.left;
            console.log('using left');
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
            console.log('descending', depth);
            console.log(current);
            let baseDepth = depth - 1;
            let newTargetParent = current;
            newTarget = current.right;
            stack[depth] = [newTarget, true];
            depth += 1;
            while (newTarget.left != null) {
              newTargetParent = newTarget;
              newTarget = newTarget.left;
              stack[depth] = [newTarget, false];
              depth += 1;
            }
            if (depth > baseDepth + 2) {
              newTargetParent.left = newTarget.right;
            }
            newTarget.left = current.left;
            newTarget.right = depth === baseDepth + 2 ? null : current.right;
            newTarget.balanceFactor = current.balanceFactor;
            // Height has changed; remove the bottom node and replace pointer
            // in baseDepth node.
            // Removing the bottom node will be done at the bottom?
            if (baseDepth > 0) {
              stack[baseDepth][0] = newTarget;
            } else {
              rootNode = newTarget;
            }
            console.log(newTarget);
          }
          // Set the parent object right now; it's hard to do this in retracing
          // loop.
          if (parent != null) {
            if (parentDir) {
              parent.right = newTarget;
              parent.balanceFactor -= 1;
            } else {
              parent.left = newTarget;
              parent.balanceFactor += 1;
            }
          } else {
            this.root = newTarget;
          }
          depth -= 1;
          break;
        } else if (result > 0) {
          // key > current.key
          if (current.right == null) return false;
          parent = current;
          parentDir = true;
          current = current.right;
          stack[depth] = [current, true];
          depth += 1;
        } else {
          // key < current.key
          if (current.left == null) return false;
          parent = current;
          parentDir = false;
          current = current.left;
          stack[depth] = [current, false];
          depth += 1;
        }
      }
    }
    console.log(stack.slice(0, depth).map((v) => [v[0].key, v[1]]));
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
      if (newCurrent.balanceFactor !== 0) {
        return true;
      }
      parent.balanceFactor += dir ? -1 : 1;
    }
    if (rootNode != null) {
      this.root = rebalance(rootNode);
    }
    return true;
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
  get [Symbol.toStringTag](): string {
    return 'AVLSortedMap';
  }

}
