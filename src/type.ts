export interface Engine {
}

export interface EngineIndex {
  register(engine: Engine): void,
  unregister(engine: Engine): void,
}

export interface EngineStore {
  register(engine: Engine): void,
  unregister(engine: Engine): void,
}
