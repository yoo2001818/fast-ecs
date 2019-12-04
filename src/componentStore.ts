import RedBlackSortedMap from './sortedMap/rb';

export default class ComponentStore<T> {
  sortedMap: RedBlackSortedMap<number, T>;
  constructor() {
    this.sortedMap = new RedBlackSortedMap((a, b) => a - b);
  }

  get(id: number): T | undefined {
    return this.sortedMap.get(id);
  }

  set(id: number, value: T): void {
    this.sortedMap.set(id, value);
  }

  delete(id: number): void {
    this.sortedMap.delete(id);
  }
}