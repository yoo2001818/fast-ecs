export type Component = any;

// Entity is completely opaque type for now.
export type Entity = number;

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

// The goal is to store the game state efficiently as possible to quickly
// enumerate required entities, and mutate them also quickly as possible.
// Basically, we're building a single-threaded DBMS... 

// The game state should be divided to two things.
// - Actual game state, which can be anything.
// - Index data of game state, which helps actual game code to quickly find
//   needed entities.
//
// However, since game state can be mutated, it should at least ensure some
// kind of ACID - rollback is not required, however, it should be reliable.

// Actual game state can be stored per entity. Or it can be stored per each
// component. Using an array for each component should be good enough, but if
// it becomes concern, it should be a B+ tree or something.
//
// Index data is derived from game state, and other index can also depend on
// other indexes. For example, a bitset for entities having a position
// component, can be intersected with another bitset.
// Or it can be index of values, such as quad tree, or B tree. 

export interface BitSet extends Iterable<number>, Set<number> {
}
