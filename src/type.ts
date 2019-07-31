export type Component = any;

// Entity is completely opaque type for now.
export type Entity = unknown;

export interface Signal<T> {
  emit(value: T): void,
  
  addListener(listener: (value: T) => void): void,
  removeListener(listener: (value: T) => void): void,
}

export interface QueuedSignal<T> {
  hasQueue(): boolean,
  flush(): void,
  emit(value: T): void,
  
  addListener(listener: (values: T[]) => void): void,
  removeListener(listener: (values: T[]) => void): void,

  addImmediateListener(listener: (value: T) => void): void,
  removeImmediateListener(listener: (value: T) => void): void,

  addQueuedListener(listener: () => void): void,
  removeQueuedListener(listener: () => void): void,
}

export interface ComponentStore<T> {
  added: QueuedSignal<Entity>,
  changed: QueuedSignal<Entity>,
  removed: QueuedSignal<Entity>,

  get(entity: Entity): T | undefined,
  has(entity: Entity): boolean,
  set(entity: Entity, value: T): void,
  setChanged(entity: Entity): void,
  forEach(callback: (entity: Entity) => void): void,
}

export interface System {
  init?(): void,
  update?(payload: any): void,
}

export interface Query {
  patterns: string[],

  added: QueuedSignal<Entity>,
  removed: QueuedSignal<Entity>,
  forEach(callback: (entity: Entity) => void): void,

  addRef(): void;
  release(): void;
}

export interface QuerySystem extends System {
  getQuery(names: string[]): Query;
}

export type ComponentMap = { [key: string]: unknown };
export type SystemMap = { [key: string]: System };

export interface Engine<C = ComponentMap, S = SystemMap> {
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
