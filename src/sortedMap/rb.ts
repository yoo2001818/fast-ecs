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
  toJSON() {
    return {
      key: this.key,
      value: this.value,
      isRed: this.isRed,
      left: this.left,
      right: this.right,
    }
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
  if (t23 != null) t23.parent = node;
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
  if (t23 != null) t23.parent = node;
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
    let current = this.root;
    while (true) {
      const result = this.comparator(key, current.key);
      if (result === 0) {
        // Target node is found.
        break;
      } else if (result > 0) {
        // key > current.key
        if (current.right != null) {
          current = current.right;
        } else {
          return false;
        }
      } else if (result < 0) {
        // key < current.key
        if (current.left != null) {
          current = current.left;
        } else {
          return false;
        }
      }
    }
    // In red black tree, 'null' is considered a child and therefore all
    // deletion is considered two children deletion.
    if (current.left != null && current.right != null) {
      console.log('Both deletion');
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
      let replacement = current.right;
      while (replacement.left != null) {
        replacement = replacement.left;
      }
      // Copy replacement's contents into current node.
      current.key = replacement.key;
      current.value = replacement.value;
      // Then, try to run deletion algorithm for the replacement node (to
      // properly set replacement's right)
      current = replacement;
    }

    console.log(JSON.stringify(this.root, null, 2));
    console.log('grabbed', current.key);

    this.size -= 1;

    let parent = current.parent;
    let currentDir = parent != null && parent.right === current;
    const child = current.left != null ? current.left : current.right;

    console.log(child);

    // Child will replace the current node. If child is null, just consider it
    // black go on with it.
    
    // If child or current is red, mark the replaced child as black, and we're
    // done. Since no two consecutive red node is not allowed, this will
    // effectively mean one of the node is black.
    if (current.isRed || (child != null && child.isRed)) {
      console.log('Marking red...');
      if (child != null) {
        child.isRed = false;
        child.parent = parent;
      }
      if (parent != null) {
        if (currentDir) parent.right = child;
        else parent.left = child;
      } else {
        this.root = child;
      }
      return true;
    }

    // If both child and current is black, we need to rebalance the tree
    // accordingly. We need to consider node as 'double black'.
    if (parent != null) {
      console.log('Overwriting...');
      // Parent reference is wrong. WTF?
      if (child != null) child.parent = parent;
      if (currentDir) parent.right = child;
      else parent.left = child;
      console.log(JSON.stringify(parent, null, 2));
    } else {
      console.log('Setting root...');
      this.root = child;
      if (child != null) {
        child.parent = null;
        child.isRed = false;
      }
      return true;
    }
    current = child;
    // parent must be present at this point
    // TODO since double black is need to perform this, we need to do this even
    // if current is null...
    while (true) {
      if (parent == null) {
        // Paint current to black, then leave.
        if (current != null) current.isRed = false;
        return true;
      }
      let sibling = currentDir ? parent.left : parent.right;
      if (sibling == null || !sibling.isRed) {
        if (sibling == null) {
          console.log('How did this happen?');
          console.log(JSON.stringify(parent, null, 2));
        }
        const siblingLeftIsRed = sibling.left != null && sibling.left.isRed;
        const siblingRightIsRed = sibling.right != null && sibling.right.isRed;
        console.log('sibling', siblingLeftIsRed, siblingRightIsRed);
        if (siblingLeftIsRed || siblingRightIsRed) {
          const grandparent = parent.parent;
          const grandparentDir =
            grandparent != null && grandparent.right === parent;
          if (currentDir) {
            // Left case
            if (siblingRightIsRed) {
              // Left right case
              sibling = leftRotate(sibling);
              parent.left = sibling;
            }
            parent = rightRotate(parent);
          } else {
            // Right case
            if (siblingLeftIsRed) {
              // Right left case
              sibling = rightRotate(sibling);
              parent.right = sibling;
            }
            parent = leftRotate(parent);
          }
          if (grandparent == null) {
            this.root = parent;
          } else if (grandparentDir) {
            grandparent.right = parent;
          } else {
            grandparent.left = parent;
          }
          return true;
        } else {
          // If sibling is black and its children are black, paint sibling red,
          // and repeat for the parent.
          console.log('...');
          sibling.isRed = true;
          if (parent.isRed) {
            parent.isRed = false;
            return true;
          }
          current = parent;
          parent = current.parent;
          currentDir = parent != null && parent.right === current;
        }
      } else {
        // Sibling is red...
        console.log('sibling is red');
        const grandparent = parent.parent;
        const grandparentDir =
          grandparent != null && grandparent.right === parent;
        if (!currentDir) {
          // Sibling is on the right side; left rotate the parent.
          sibling.isRed = false;
          parent.isRed = true;
          parent = leftRotate(parent);
        } else {
          // Sibling is on the left side; right rotate the parent.
          sibling.isRed = false;
          parent.isRed = true;
          parent = rightRotate(parent);
        }
        if (grandparent == null) {
          this.root = parent;
        } else if (grandparentDir) {
          grandparent.right = parent;
        } else {
          grandparent.left = parent;
        }
      }
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
        if (current != null) {
          stack.push(current);
          while (current.left != null) {
            stack.push(current.left);
            current = current.left;
          }
        }
      } else {
        let current = this.root;
        if (current != null) {
          stack.push(current);
          while (current.right != null) {
            stack.push(current.right);
            current = current.right;
          }
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
