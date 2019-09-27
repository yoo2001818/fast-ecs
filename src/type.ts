export type Component = any;

// Entity is completely opaque type for now.
export type Entity = number;

export interface SortedMap<K, V> {
  get(key: K): V | undefined,
  has(key: K): boolean,
  set(key: K, value: V): void,
  remove(key: K): void,

  forEach(callback: (value: V) => void): void,
  forEachKeys(callback: (key: K) => void): void,
  forEachEntries(callback: (key: K, value: V) => void): void,
}

export interface SortedMapFactory<K, V> {
  and(a: SortedMap<K, V>, b: SortedMap<K, V>): SortedMap<K, V>,
  or(a: SortedMap<K, V>, b: SortedMap<K, V>): SortedMap<K, V>,
  xor(a: SortedMap<K, V>, b: SortedMap<K, V>): SortedMap<K, V>,
}

export interface Signal<T> {
  emit(value: T): void,
  
  addListener(listener: (value: T) => void): void,
  removeListener(listener: (value: T) => void): void,
}

export interface QueuedSignal<T> {
  hasQueue(): boolean,
  flush(): void,
  emit(value: T): void,
  
  addListener(listener: (value: T) => void): void,
  removeListener(listener: (value: T) => void): void,

  addImmediateListener(listener: (value: T) => void): void,
  removeImmediateListener(listener: (value: T) => void): void,

  addQueuedListener(listener: () => void): void,
  removeQueuedListener(listener: () => void): void,
}

export interface EntitySignal<T> extends QueuedSignal<T> {
  queue: SortedMap<Entity, T>,

  constructor(getEntity: (value: T) => Entity): EntitySignal<T>,
}

export interface ComponentStore<T> extends SortedMap<Entity, T> {
  added: EntitySignal<Entity>,
  changed: EntitySignal<Entity>,
  removed: EntitySignal<Entity>,

  setChanged(entity: Entity): void,
}

export interface System {
  init?(): void,
  update?(payload: any): void,
}

export interface Query {
  patterns: string[],

  added: EntitySignal<Entity>,
  removed: EntitySignal<Entity>,
  forEach(callback: (entity: Entity) => void): void,

  addRef(): void,
  release(): void,
}

export interface QuerySystem extends System {
  getQuery(names: string[]): Query,
}

export interface SymbolList<K = string> {
  append(key: K): number,
  indexOf(key: K): number,
  remove(key: K): void,
  forEach(callback: (key: K) => void): void,
}

export type ComponentMap = { [key: string]: unknown };
export type SystemMap = { [key: string]: System };

export interface Engine<C = ComponentMap, S = SystemMap> {
  componentNames: SymbolList<keyof C>,
  state: (C[keyof C])[],

  systems: S,

  addComponent<K extends keyof C>(
    name: K,
    componentStore: ComponentStore<C[K]>,
  ): Engine<C>,
  getComponent<K extends keyof C>(name: K): ComponentStore<C[K]>,

  addSystem<K extends keyof S>(
    name: K,
    initializer: () => S[K],
  ): void,
  getSystem<K extends keyof S>(name: K): S[K],

  getEntitySignal(name: string): QueuedSignal<any & { entity: Entity }>,
  getSignal(name: string): Signal<any>,

  createEntity(values?: { [key: string]: unknown }): Entity,
  deleteEntity(entity: Entity): void,

  getQuery(names: (keyof C)[]): Query,

  init(): void,
  update(payload: any): void,
  run(callback: () => void): void,

  serialize(): unknown,
  deserialize(data: unknown): void,
}
