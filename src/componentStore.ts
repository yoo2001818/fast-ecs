import RedBlackSortedMap from './sortedMap/rb';
import { Engine, EngineStore } from './type';

export default class ComponentStore<T> implements EngineStore {
  name: string;
  sortedMap: RedBlackSortedMap<number, T>;
  constructor(name: string) {
    this.sortedMap = new RedBlackSortedMap((a, b) => a - b);
    this.name = name;
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

  register(engine: Engine): void {

  }

  unregister(): void {

  }
}
