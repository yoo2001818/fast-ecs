import AVLSortedMap, { Node } from './avl';

function assertNodeHeight<K, V>(node: Node<K, V>): number {
  let left = 0;
  let right = 0;
  if (node == null) return 0;
  if (node.left != null) left = assertNodeHeight(node.left);
  if (node.right != null) right = assertNodeHeight(node.right);
  if (node.balanceFactor !== (right - left)) {
    console.log(JSON.stringify(node, null, 2));
    throw new Error('Node balance factor failure - ' +
      node.value + ', ' + node.balanceFactor + ', ' + (right - left));
  }
  if (Math.abs(left - right) > 1) {
    console.log(JSON.stringify(node, null, 2));
    throw new Error('Node height assertion failure - ' +
      left + ', ' + right);
  }
  return Math.max(left, right) + 1;
}

describe('AVLSortedMap', () => {
  it('should correctly insert nodes from simple tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    expect(map.size).toBe(3);
    expect([...map.values()]).toEqual([1, 2, 3]);
    assertNodeHeight(map.root);
  });
  it('should correctly insert nodes from complex tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    let input = Array.from({ length: 100 }, (_, i) => i);
    input.forEach(v => {
      map.set(v, v);
      assertNodeHeight(map.root);
    });
    expect(map.size).toBe(input.length);
    expect([...map.values()]).toEqual(input);
  });
  it('should correctly insert nodes from very complex tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    for (let i = 0; i < 1000000; i += 1) {
      map.set(i, i);
    }
    expect(map.size).toBe(1000000);
  });
  /*
  it('should correctly remove nodes from simple tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    expect(map.delete(2)).toBe(true);
    expect(map.size).toBe(2);
    expect([...map.values()]).toEqual([1, 3]);
  });
  */
  it('should correctly remove nodes from complex tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    let input = Array.from({ length: 10 }, (_, i) => i);
    input.forEach(v => map.set(v, v));
    for (let i = 0; i < input.length - 1; i += 1) {
      let j = (Math.random() * (input.length - 1 - i) | 0) + i;
      let prev = input[i];
      input[i] = input[j];
      input[j] = prev;
    }
    input.forEach((v, i) => {
      console.log(v);
      map.delete(v);
      console.log(JSON.stringify(map.root, null, 2));
      assertNodeHeight(map.root);
      expect(map.size).toBe(input.length - i - 1);
    });
  });
  /*
  it('should correctly remove nodes from very complex tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    for (let i = 0; i < 1000000; i += 1) {
      map.set(i, i);
    }
    for (let i = 0; i < 1000000; i += 1) {
      map.delete(i);
    }
  });
  */
});
