import Engine from './engine';

export interface EngineIndex {
  register(engine: Engine): void,
  unregister(engine: Engine): void,
}

export interface EngineStore {
  register(engine: Engine): void,
  unregister(engine: Engine): void,
}

export interface ComponentStore<T> extends EngineStore {
  get(id: number): T | undefined,
  set(id: number, value: T): void,
  delete(id: number): void,
}

export interface EngineHelper {
  register(engine: Engine): void,
  unregister(engine: Engine): void,
}

export interface EngineSystem {
  register(engine: Engine): void,
  unregister(engine: Engine): void,
}
