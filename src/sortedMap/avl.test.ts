import AVLSortedMap, { Node } from './avl';

function assertNodeHeight<K, V>(node: Node<K, V>): number {
  let left = 0;
  let right = 0;
  if (node.left != null) left = assertNodeHeight(node.left);
  if (node.right != null) right = assertNodeHeight(node.right);
  if (node.balanceFactor !== (right - left)) {
    console.log('Balance factor aaaa');
  }
  if (Math.abs(left - right) > 1) {
    console.log(node);
    throw new Error('Node height assertion failure - ' +
      left + ', ' + right);
  }
  return Math.max(left, right) + 1;
}

describe('AVLSortedMap', () => {
  it('should correctly insert nodes for simple tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    expect(map.size).toBe(3);
    expect([...map.values()]).toEqual([1, 2, 3]);
    assertNodeHeight(map.root);
  });
  it('should correctly insert nodes for complex tree', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    let input = Array.from({ length: 100 }, (_, i) => i);
    input.forEach(v => map.set(v, v));
    expect(map.size).toBe(input.length);
    assertNodeHeight(map.root);
    expect([...map.values()]).toEqual(input);
  });
  it('should correctly remove nodes', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    expect(map.delete(2)).toBe(true);
    expect(map.delete(2)).toBe(false);
    expect(map.size).toBe(2);
    expect([...map.values()]).toEqual([1, 3]);
  });
});
