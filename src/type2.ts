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
// Index data can be updated immediately, or updated at the end of state update.
// If we really want to optimize this, a component should only
// be modifiable by few systems, and reindexing should be run after that.
//
// Let's assume a simple game, entity moves to right, and it 'dies' when
// certain threshold has reached. There's other entities which doesn't do
// anything.
// 
// update ---
//   position ----> moveRight ----> position
//   position ----> death ----> entityModification
//   position ----> render
//
// In this case, only 'moveRight' processes the position. If we can decouple
// component modification's reading / writing, it may be trivial to implement
// the game, without concerning the 'order' of the system.
//
// However, most games are complex. Position should may be modified by other
// systems, and other system may need to immediately react to it. While the best
// form for a single system is (state, action) => state, it is simply not
// possible.
//
// Furthermore, game state can be modified by other than game update tick
// itself, therefore indexing must be kept updated regardless of the timing.
//
// This, obviously means it needs a mechanism for keeping updated state,
// ... which is a signal.
//
// However, systems need to rely on game state, otherwise it won't be
// deterministic. Only indexes, and external outputs need to be updated this
// way.
//
// But systems do need to track updated entities. For this purpose, indexes
// can provide which entities has changed recently. 
//
// ... Since most of the bitset can be derived from signals, it'd still support
// signals. However, it should provide interface for triggering signals.
// Furthermore, it should provide minimal 'standard' of the signals.
//
// engine.createEntity({ ... }) should trigger entityCreated, componentAdded,
// etc.
// Signal could have partition key, i.e. componentAdded subscribers can
// subscribe to only interested components. This should be implemented using
// hashmap.
//
// While createEntity, addComponent, etc should trigger signal automatically,
// it is required to support custom signals. It should be triggered by
// other systems.
//
// Systems can trigger signals, but systems shouldn't subscribe to signals -
// but an index should subscribe to signal, and change its indexing data.
// System / component data should be kept using this method.

export interface BitSet extends Iterable<number>, Set<number> {
}
