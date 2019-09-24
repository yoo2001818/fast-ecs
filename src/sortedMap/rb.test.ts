import RedBlackSortedMap from './rb';

describe('RedBlackWoStackSortedMap', () => {
  it('should correctly insert nodes from simple tree', () => {
    let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    expect(map.size).toBe(3);
    expect([...map.values()]).toEqual([1, 2, 3]);
  });
  it('should correctly insert nodes from complex tree', () => {
    let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
    let sortedInput = Array.from({ length: 10 }, (_, i) => i);
    let input = sortedInput.slice();
    for (let i = 0; i < input.length - 1; i += 1) {
      let j = (Math.random() * (input.length - 1 - i) | 0) + i;
      let prev = input[i];
      input[i] = input[j];
      input[j] = prev;
    }
    input.forEach(v => {
      map.set(v, v);
    });
    expect(map.size).toBe(input.length);
    expect([...map.values()]).toEqual(sortedInput);
  });
  it('should correctly insert nodes from very complex tree', () => {
    let map = new RedBlackSortedMap<number, number>((a, b) => a - b);
    for (let i = 0; i < 1000000; i += 1) {
      map.set(i, i);
    }
    expect(map.size).toBe(1000000);
  });
  it('should correctly remove nodes from simple tree', () => {
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
    input = [8, 7, 0, 1, 2, 3, 4, 5, 6, 9];
    input.forEach((v, i) => {
      console.log('---- ' + v);
      map.delete(v);
      console.log(JSON.stringify(map.root, null, 2));
      expect([...map.values()])
        .toEqual(sortedInput.filter(k => !input.slice(0, i + 1).includes(k)));
    });
  });
  it('should correctly remove nodes from very complex tree', () => {
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
