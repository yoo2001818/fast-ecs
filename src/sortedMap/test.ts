import AVLSortedMap from './avl';
setInterval(() => {
  (() => {
    let map = new AVLSortedMap<number, number>((a, b) => a - b);
    let d = Date.now();
    for (let i = 0; i < 1000000; i += 1) {
      map.set(i, i);
    }
    console.log('a', Date.now() - d);
  })();
  (() => {
    let map2 = new AVLSortedMap<number, number>((a, b) => a - b);
    let d2 = Date.now();
    for (let i = 0; i < 1000000; i += 1) {
      map2.set2(i, i);
    }
    console.log('b', Date.now() - d2);
  })();
}, 0);
