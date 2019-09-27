import { SortedMap } from '../sortedMap';
import RedBlackSortedMap from '../sortedMap/rb';
// import EntitySignal from '../signal/entitySignal';
import { Entity, EntitySignal } from '../type';

export default class ComponentStore<T> implements SortedMap<Entity, T> {
  // Is the delegation really necessary?
  map: SortedMap<Entity, T>;
  added: EntitySignal<Entity>;
  changed: EntitySignal<Entity>;
  removed: EntitySignal<Entity>;
  constructor(map?: SortedMap<Entity, T>) {
    if (map == null) {
      this.map = new RedBlackSortedMap((a, b) => b - a);
    } else {
      this.map = map;
    }
    // TODO
    this.added = null;
    this.changed = null;
    this.removed = null;
  }
  get(key: Entity): T | undefined {
    return this.map.get(key);
  }
  has(key: Entity): boolean {
    return this.map.has(key);
  }
  set(key: Entity, value: T): void {
    this.setChanged(key);
    return this.map.set(key, value);
  }
  setChanged(key: Entity): void {
    this.changed.emit(key);
  }
  remove(key: Entity): void {
    return this.map.remove(key);
  }

  forEach(callback: (value: T) => void): void {
    return this.map.forEach(callback);
  }
  forEachKeys(callback: (key: Entity) => void): void {
    return this.map.forEachKeys(callback);
  }
  forEachEntries(callback: (key: Entity, value: T) => void): void {
    return this.map.forEachEntries(callback);
  }
}
