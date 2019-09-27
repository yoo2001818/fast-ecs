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
  set(key: Entity, value: T): this {
    this.setChanged(key);
    this.map.set(key, value);
    return this;
  }
  setChanged(key: Entity): void {
    this.changed.emit(key);
  }
  delete(key: Entity): boolean {
    return this.map.delete(key);
  }
  clear(): void {
    return this.map.clear();
  }

  entries(
    start?: Entity,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<[Entity, T]> {
    return this.map.entries(start, after, reversed);
  }

  keys(
    start?: Entity,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<Entity> {
    return this.map.keys(start, after, reversed);
  }

  values(
    start?: Entity,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<T> {
    return this.map.values(start, after, reversed);
  }

  forEach(
    callback: (value: T, key: Entity, map: SortedMap<Entity, T>) => void,
    thisArg?: any,
  ): void {
    return this.map.forEach(callback, thisArg);
  }

  [Symbol.iterator](): IterableIterator<[Entity, T]> {
    return this.map[Symbol.iterator]();
  }
}
