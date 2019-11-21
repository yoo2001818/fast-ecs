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
    });
    it('should handle trivial red case', () => {
    });
    it('should handle left / left case', () => {

    });
    it('should handle left / right case', () => {

    });
    it('should handle right / right case', () => {

    });
    it('should handle right / left case', () => {

    });
    it('should handle parent recursion', () => {

    });
    it('should handle left case', () => {

    });
    it('should handle right case', () => {

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
