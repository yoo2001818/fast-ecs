import AVLSortedMap from './avl';

describe('AVLSortedMap', () => {
  it('should correctly insert nodes', () => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    map.set(1, 1);
    map.set(3, 3);
    map.set(2, 2);
    console.log(JSON.stringify(map, null, 2));
  });
});
;
