export type Component = any;

// Entity is completely opaque type for now.
export type Entity = unknown;

export interface Signal<T> {
  emit(value: T): void,
  
  addListener(listener: (value: T) => void): void,
  removeListener(listener: (value: T) => void): void,
}

export interface QueuedSignal<T> extends Signal<T> {
  hasQueue(): boolean,
  flush(): void,

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

export type ComponentMap = { [key: string]: ComponentStore<unknown> },

export interface Engine<C = ComponentMap> {
  addComponent<K extends keyof C>(name: K, componentStore: C[K]): Engine<C>,
  getComponent<K extends keyof C>(name: K): C[K],

  addSystem(name: string, initializer: () => System): void,
  getSystem(name: string): System,

  getEntitySignal(name: string): QueuedSignal<any & { entity: Entity }>,
  getSignal(name: string): Signal<any>,

  createEntity(values?: { [key: string]: unknown }): Entity,
  deleteEntity(entity: Entity): void,

  init(): void,
  update(payload: any): void,
  run(callback: () => void): void,

  serialize(): unknown,
  deserialize(data: unknown): void,
}
