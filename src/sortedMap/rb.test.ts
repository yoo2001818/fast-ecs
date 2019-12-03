import RedBlackSortedMap, { Node } from './rb';

function assertRedBlackInvariant<K, V>(node: Node<K, V>): number {
  if (node == null) return 1;
  const leftCount = assertRedBlackInvariant(node.left);
  const rightCount = assertRedBlackInvariant(node.right);
  if (leftCount !== rightCount) {
    console.log(JSON.stringify(node, null, 2));
    throw new Error('Red black tree invariant broken');
  }
  return leftCount + (node.isRed ? 0 : 1);
}

describe('RedBlackWoStackSortedMap', () => {
  describe('#set', () => {
    it('should insert nodes', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 1);
      map.set(3, 3);
      map.set(2, 2);
      expect(map.size).toBe(3);
      expect([...map.values()]).toEqual([1, 2, 3]);
    });
    it('should override value if conflicts', () => {
      let map = new RedBlackSortedMap<number, string>((a, b) => a - b);
      map.set(1, 'a');
      map.set(1, 'b');
      expect([...map.values()]).toEqual(['b']);
    });
    it('should handle recursive recoloring', () => {
      //  
      //          5.                    5.
      //      3.      7.   -->      3      7.
      //    2   4   6   8         2.  4. 6   8
      //  1                     1
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(5, 5);
      map.set(3, 3);
      map.set(7, 7);
      map.set(2, 2);
      map.set(4, 4);
      map.set(6, 6);
      map.set(8, 8);
      assertRedBlackInvariant(map.root);
    });
    it('should handle left rotation', () => {
      //  1.          2.
      //    2   --> 1   3
      //      3
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 1);
      map.set(2, 2);
      map.set(3, 3);
      assertRedBlackInvariant(map.root);
    });
    it('should handle left / right rotation', () => {
      //   1.         2.
      //     3  --> 1   3
      //   2
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 1);
      map.set(3, 3);
      map.set(2, 2);
      assertRedBlackInvariant(map.root);
    });
    it('should handle right rotation', () => {
      //      3.      2.
      //    2   --> 1   3
      //  1
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(3, 3);
      map.set(2, 2);
      map.set(1, 1);
      assertRedBlackInvariant(map.root);
    });
    it('should handle right / left rotation', () => {
      //   3.       2.
      // 1    --> 1   3
      //   2
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(3, 3);
      map.set(1, 1);
      map.set(2, 2);
      assertRedBlackInvariant(map.root);
    });
  });
  describe('#delete', () => {
    it('should delete nodes', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 1);
      map.set(2, 2);
      map.set(3, 3);
      expect(map.delete(2)).toBe(true);
      expect(map.size).toBe(2);
      expect([...map.values()]).toEqual([1, 3]);
    });
    it('should return false if not available', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 1);
      map.set(3, 3);
      expect(map.delete(2)).toBe(false);
    });
    it('should handle mid-node deletion', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      //       4                 5 
      //   2      7          2       7
      // 1   3  5   8 ---> 1   3   6   8
      //         6
      map.set(4, 4);
      map.set(2, 2);
      map.set(7, 7);
      map.set(1, 1);
      map.set(3, 3);
      map.set(5, 5);
      map.set(8, 8);
      map.set(6, 6);
      expect(map.delete(4)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(7);
      expect([...map.values()]).toEqual([1, 2, 3, 5, 6, 7, 8]);
    });
    it('should handle left / left case', () => {
      //    4.          2.
      //  2.  5.      1.  4.
      // 1 3    --->   3
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(4, 4);
      map.set(2, 2);
      map.set(5, 5);
      map.set(1, 1);
      map.set(3, 3);
      expect(map.delete(5)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(4);
    });
    it('should handle left / right case', () => {
      //    4.          3.
      //  2.  5.      2.  4.
      //   3    --->
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(4, 4);
      map.set(2, 2);
      map.set(5, 5);
      map.set(3, 3);
      expect(map.delete(5)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(3);
    });
    it('should handle right / right case', () => {
      //    2.           4.
      //  1.  4.       2.  5.
      //    3   5 --->    3
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(2, 2);
      map.set(1, 1);
      map.set(4, 4);
      map.set(3, 3);
      map.set(5, 5);
      expect(map.delete(1)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(4);
    });
    it('should handle right / left case', () => {
      //   2.         3.
      // 1. 4. -->  2. 4.
      //   3
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(2, 2);
      map.set(1, 1);
      map.set(4, 4);
      map.set(3, 3);
      expect(map.delete(1)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(3);
    });
    it('should handle left case', () => {
      //     5.
      //   3   7.
      //  2.4.6 8 ---> delete 7 (6 and 8 must be deleted first)
      // 1
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      [5, 3, 7, 2, 4, 6, 8, 1].forEach(v => map.set(v, v));
      map.delete(6);
      map.delete(8);
      assertRedBlackInvariant(map.root);
      expect(map.delete(7)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(5);
    });
    it('should handle right case', () => {
      //    3.
      //  1. 5 ----> delete 1
      // 0 24.6. 
      //       7
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      [3, 1, 5, 0, 2, 4, 6, 7].forEach(v => map.set(v, v));
      map.delete(0);
      map.delete(2);
      assertRedBlackInvariant(map.root);
      expect(map.delete(1)).toBe(true);
      assertRedBlackInvariant(map.root);
      expect(map.size).toBe(5);
    });
    it('should handle parent recursion', () => {

    });
    it('should correctly remove nodes from complex tree', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      let sortedInput = Array.from({ length: 10 }, (_, i) => i);
      let input = sortedInput.slice();
      input.forEach(v => map.set(v, v));
      for (let i = 0; i < input.length - 1; i += 1) {
        let j = (Math.random() * (input.length - 1 - i) | 0) + i;
        let prev = input[i];
        input[i] = input[j];
        input[j] = prev;
      }
      input.forEach((v, i) => {
        map.delete(v);
        expect([...map.values()]).toEqual(sortedInput
          .filter(v => !input.slice(0, i + 1).includes(v)));
        assertRedBlackInvariant(map.root);
      });
      expect(map.size).toBe(0);
      expect([...map.values()]).toEqual([]);
    });
  });
  describe('#get', () => {
    it('should return value for given key', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 130);
      map.set(2, 1);
      expect(map.get(1)).toBe(130);
      expect(map.get(2)).toBe(1);
    });
    it('should return undefined if not exists', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 130);
      expect(map.get(100)).toBe(undefined);
    });
  });
  describe('#has', () => {
    it('should return true if exists', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 130);
      map.set(2, 1);
      expect(map.has(1)).toBe(true);
      expect(map.has(2)).toBe(true);
    });
    it('should return false if not exists', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 130);
      expect(map.has(100)).toBe(false);
    });
  });
  describe('#clear', () => {
    it('should clear the entire tree', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      map.set(1, 1);
      map.set(2, 2);
      map.set(3, 3);
      map.set(4, 4);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.get(1)).toBe(undefined);
    });
  });
  describe('#entries', () => {
    it('should correctly traverse the tree', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      for (let i = 0; i < 10; i += 1) {
        map.set(i, i);
      }
      expect([...map.entries(5)]).toEqual([5, 6, 7, 8, 9].map(v => [v, v]));
      expect([...map.entries(5, true)]).toEqual([6, 7, 8, 9].map(v => [v, v]));
      expect([...map.entries(5, false, true)])
        .toEqual([5, 4, 3, 2, 1, 0].map(v => [v, v]));
      expect([...map.entries(5, true, true)]).toEqual([4, 3, 2, 1, 0].map(v => [v, v]));
    });
  });
  describe('#keys', () => {
    it('should correctly traverse the tree', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      for (let i = 0; i < 10; i += 1) {
        map.set(i, i);
      }
      expect([...map.keys(5)]).toEqual([5, 6, 7, 8, 9]);
      expect([...map.keys(5, true)]).toEqual([6, 7, 8, 9]);
      expect([...map.keys(5, false, true)]).toEqual([5, 4, 3, 2, 1, 0]);
      expect([...map.keys(5, true, true)]).toEqual([4, 3, 2, 1, 0]);
    });
  });
  describe('#values', () => {
    it('should correctly traverse the tree', () => {
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      for (let i = 0; i < 10; i += 1) {
        map.set(i, i);
      }
      expect([...map.values(5)]).toEqual([5, 6, 7, 8, 9]);
      expect([...map.values(5, true)]).toEqual([6, 7, 8, 9]);
      expect([...map.values(5, false, true)]).toEqual([5, 4, 3, 2, 1, 0]);
      expect([...map.values(5, true, true)]).toEqual([4, 3, 2, 1, 0]);
    });
  });
  describe('#forEach', () => {
    it('should correctly traverse the tree', () => {
      const callback = jest.fn(x => x);
      let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
      for (let i = 0; i < 5; i += 1) {
        map.set(i, i);
      }
      map.forEach(callback);
      expect(callback.mock.calls).toEqual([
        [0, 0, map],
        [1, 1, map],
        [2, 2, map],
        [3, 3, map],
        [4, 4, map],
      ]);
    });
  });
});
