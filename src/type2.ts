export type Entity = number;

export interface Engine {
  state: { [key: string]: unknown },
  indexes: { [key: string]: unknown },
  signals: { [key: string]: Signal<unknown> },
  systems: { [key: string]: SystemConfig },

  createEntity(): Entity,
  deleteEntity(entity: Entity): Entity,

  getSignal<T>(name: string): Signal<T>,

  addSystem(name: string, config: SystemConfig): void,

  // If Engine could understand all index types, it could return an appropriate
  // index when a schema is given.
  addIndex(name: string, value: any): void,
  getIndex(name: string): any,

  addState(name: string, value: any): void,
  getState(name: string): any,

  update(action: any): void,
}

export interface SystemConfig {
  onUpdate: (action: any) => void,
  after: string[],
  before: string[],
}

export interface IdStore {
  size: number,

  create(): Entity,
  has(key: Entity): boolean,
  add(key: Entity): this,
  delete(key: Entity): boolean,
  clear(): void,

  entries(
    start?: Entity,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<[Entity, Entity]>,
  keys(
    start?: Entity,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<Entity>,
  values(
    start?: Entity,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<Entity>,
  forEach(
    callback: (value: Entity, key: Entity, map: IdStore) => void,
    thisArg?: any,
  ): void,
  [Symbol.iterator](): IterableIterator<Entity>,
}

export interface SortedMap<K, V> extends Iterable<[K, V]>, Map<K, V> {
  size: number,

  get(key: K): V | undefined,
  has(key: K): boolean,
  set(key: K, value: V): this,
  delete(key: K): boolean,
  clear(): void,

  entries(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<[K, V]>,
  keys(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<K>,
  values(
    start?: K,
    after?: boolean,
    reversed?: boolean,
  ): IterableIterator<V>,
  forEach(
    callback: (value: V, key: K, map: SortedMap<K, V>) => void,
    thisArg?: any,
  ): void,
  [Symbol.iterator](): IterableIterator<[K, V]>,
}

export type ComponentStore<V> = SortedMap<Entity, V>;

export interface BitSet extends Set<number> {
  cardinality: number,
  length: number,

  and(set: BitSet): BitSet,
  andNot(set: BitSet): BitSet,
  or(set: BitSet): BitSet,
  xor(set: BitSet): BitSet,
  set(key: number, value: boolean): this,
}

export type ComponentIndex = BitSet;

export interface Signal<T> {
  addListener(
    key: string | null,
    callback: (key: string, value: T) => void,
  ): void;
  removeListener(
    key: string | null,
    callback: (key: string, value: T) => void,
  ): void;

  emit(key: string, value: T): void;
}
