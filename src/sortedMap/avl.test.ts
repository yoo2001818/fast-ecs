import AVLSortedMap from './avl';

describe('AVLSortedMap', () => {
  it('should correctly insert nodes', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    expect(map.size).toBe(3);
    expect([...map.values()]).toEqual([1, 2, 3]);
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
