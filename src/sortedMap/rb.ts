import { SortedMap } from './index';

export class Node<K, V> {
  key: K;
  value: V;
  parent: Node<K, V> | null;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
  isRed: boolean;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.parent = null;
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
  right.parent = node.parent;
  node.parent = right;
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
  left.parent = node.parent;
  node.parent = left;
  return left;
}

export default class RedBlackSortedMap<K, V> implements SortedMap<K, V> {
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
    if (this.root == null) {
      this.root = new Node(key, value);
      // If root is null, it's trivial - The root node is black and it's done.
      this.size += 1;
      return this;
    }
    // Descend down to the created node...
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
        } else {
          const newNode = new Node(key, value);
          newNode.isRed = true;
          newNode.parent = current;
          current.right = newNode;
          current = newNode;
          this.size += 1;
          break;
        }
      } else if (result < 0) {
        // key < current.key
        if (current.left != null) {
          current = current.left;
        } else {
          const newNode = new Node(key, value);
          newNode.isRed = true;
          newNode.parent = current;
          current.left = newNode;
          this.size += 1;
          break;
        }
      }
    }
    // Then perform a retracing loop.
    while (true) {
      // If the node is the root node, set itself to black and it's done.
      let parent = current.parent;
      if (parent == null) {
        current.isRed = false;
        this.root = current;
        return;
      }
      // If parent's color is black, do nothing as it's a valid tree.
      if (!parent.isRed) return;
      // If parent's color is red, property 4 is violated - if a node is red,
      //   its children must be all black.
      // Read the grandparent's other child (i.e. uncle)'s color.
      let grandparent = parent.parent;
      const isParentRight = grandparent.right === parent;
      const uncle = isParentRight ? grandparent.left : grandparent.right;
      if (uncle != null && uncle.isRed) {
        // If uncle node is red, both uncle and parent node's color can be
        // repainted to black, and grandparent's color can be red. However,
        // grandparent's parent's color can be red too - to resolve this,
        // we repeat the validation for the grandparent.
        uncle.isRed = false;
        parent.isRed = false;
        grandparent.isRed = true;
        current = grandparent;
      } else {
        // If uncle node is black, we have to rotate the tree to make parent to
        // be in grandparent's position (rotate right if the parent is on left
        // side, and vice versa) However, this doesn't work if the current node
        // is already occupying that side. If that's the case, rotate current
        // and parent node to make it linear.
        // Then, rotate parent node and grandparent node. Repaint parent node
        // to black, grandparent to red. Since top of the tree (= parent node)
        // is black now, no more validation is necessary.
        if (!isParentRight && parent.right === current) {
          parent = leftRotate(parent);
          grandparent.left = parent;
        } else if (isParentRight && parent.left === current) {
          parent = rightRotate(parent);
          grandparent.right = parent;
        }
        parent.isRed = false;
        grandparent.isRed = true;
        let greatgrandparent = grandparent.parent;
        if (!isParentRight) {
          const result = rightRotate(grandparent);
          if (greatgrandparent == null) {
            this.root = result;
          } else if (greatgrandparent.left === grandparent) {
            greatgrandparent.left = result;
          } else {
            greatgrandparent.right = result;
          }
        } else {
          const result = leftRotate(grandparent);
          if (greatgrandparent == null) {
            this.root = result;
          } else if (greatgrandparent.left === grandparent) {
            greatgrandparent.left = result;
          } else {
            greatgrandparent.right = result;
          }
        }
        return;
      }
    }
  }

  delete(key: K): boolean {
    if (this.root == null) return false;
    // Try to descend down to the target node first, then delete the node.
    let currentParent = null;
    let currentDir = false;
    let current = this.root;
    while (true) {
      const result = this.comparator(key, current.key);
      if (result === 0) {
        // Target node is found.
        break;
      } else if (result > 0) {
        // key > current.key
        if (current.right != null) {
          currentParent = current;
          currentDir = true;
          current = current.right;
        } else {
          return false;
        }
      } else if (result < 0) {
        // key < current.key
        if (current.left != null) {
          currentParent = current;
          currentDir = false;
          current = current.left;
        } else {
          return false;
        }
      }
    }
    // In red black tree, 'null' is considered a child and therefore all
    // deletion is considered two children deletion.
    if (current.left != null && current.right != null) {
      // If both nodes are present, remove leftmost node from right node.
      // This means that we have to traverse down to the bottom of the
      // tree.
      //
      //     a      current                d
      //    / \                           / \
      //   f   b    replacement          f   b
      //      / \                           / \
      //     c   e  replacement -->        c   e
      //    /                             /
      //   d        replacement          g
      //    \
      //     g      replacement's right
      currentParent = current;
      currentDir = true;
      let replacement = current.right;
      while (replacement.left != null) {
        currentParent = current;
        currentDir = false;
        replacement = replacement.left;
      }
      // Copy replacement's contents into current node.
      current.key = replacement.key;
      current.value = replacement.value;
      // Then, try to run deletion algorithm for the replacement node (to
      // properly set replacement's right)
      current = replacement;
    }

    const child = current.left != null ? current.left : current.right;
    // If current is red node, replace with its child, which must be black.
    // If current is black and child is red, replace with its child, and
    // repaint it to black.
    // If both node are black, it would invalidate the tree if we replace with
    // its child, then we need to go further to reconsolidate the tree.
    if (currentParent != null) {
      this.root = child;
    } else if (currentDir) {
      currentParent.right = child;
    } else {
      currentParent.left = child;
    }

    if (current.isRed) return true;
    if (child.isRed) {
      child.isRed = false;
      return true;
    }

    // We need to reoffset between the parent, current, and the sibling node. 
    current = child;

    while (true) {
      currentParent = child.parent;
      // 1. If the node is root node now, there is no height problem anymore -
      // we're done.
      if (currentParent == null) return true;
      currentDir = currentParent.right === child;
      let grandparent = currentParent.parent;
      let parent = currentParent;
      let parentDir = grandparent != null && grandparent.right === parent;
      let sibling = currentDir ? currentParent.left : currentParent.right;

      // 2. If sibling is red, reverse colors of parent and sibling, and rotate
      // so parent gets in the sibling's position. Now the current node has
      // a black sibling (sibling's child), and a red parent.
      if (sibling.isRed) {
        parent.isRed = true;
        sibling.isRed = false;
        if (currentDir) {
          parent = rightRotate(parent);
          if (grandparent == null) this.root = parent;
          else if (parentDir) grandparent.right = parent;
          else grandparent.left = parent;
          // Reset parent references...
          grandparent = parent;
          parent = current.parent;
          sibling = parent.left;
        } else {
          parent = leftRotate(parent);
          if (grandparent == null) this.root = parent;
          else if (parentDir) grandparent.right = parent;
          else grandparent.left = parent;
          // Reset parent references...
          grandparent = parent;
          parent = current.parent;
          sibling = parent.right;
        }
      }

      // 3. If parent, sibling, sibling's children are black, repaint sibling to
      // red, and restart rebalancing at the parent.
      if (!parent.isRed && !sibling.isRed &&
        (sibling.left == null || !sibling.left.isRed) &&
        (sibling.right == null || !sibling.right.isRed)
      ) {
        sibling.isRed = true;
        // Rerun loop
        current = parent;
        continue;
      }
      
      // 4. If sibling and sibling's children are black, but parent is red,
      // exchange color between sibling and the parent.
      if (parent.isRed && !sibling.isRed &&
        (sibling.left == null || !sibling.left.isRed) &&
        (sibling.right == null || !sibling.right.isRed)
      ) {
        sibling.isRed = true;
        parent.isRed = false;
        return true;
      }
      
      // 5. If sibling is black, left child is red, right child is black, and
      // current node is left child of the parent, rotate right at sibling,
      // and set colors accordingly. Then, reset sibling node, vice versa.
      if (!sibling.isRed) {
        if (
          !parentDir &&
          (sibling.left != null && sibling.left.isRed) &&
          (sibling.right == null || !sibling.right.isRed)
        ) {
          sibling.isRed = true;
          sibling.left.isRed = false;
          sibling = rightRotate(sibling);
          parent.right = sibling;
        } else if (
          parentDir &&
          (sibling.left == null || !sibling.left.isRed) &&
          (sibling.right != null && sibling.right.isRed)
        ) {
          sibling.isRed = true;
          sibling.right.isRed = false;
          sibling = leftRotate(sibling);
          parent.left = sibling;
        }
      }

      // 6. If sibiling is black, right child is red, and current node is left
      // child of parent, rotate left at the parent node. Exchange colors of
      // parent and sibling, and make sibling's right child black. 
      sibling.isRed = parent.isRed;
      parent.isRed = false;
      if (!parentDir) {
        sibling.right.isRed = false;
        parent = leftRotate(parent);
        if (grandparent == null) this.root = parent;
        else if (parentDir) grandparent.right = parent;
        else grandparent.left = parent;
      } else {
        sibling.left.isRed = false;
        parent = rightRotate(parent);
        if (grandparent == null) this.root = parent;
        else if (parentDir) grandparent.right = parent;
        else grandparent.left = parent;
      }
      return true;
    }
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
    return 'RedBlackSortedMap';
  }

}
