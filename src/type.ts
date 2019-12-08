export interface Engine {
}

export interface EngineIndex {
  register(engine: Engine);
  unregister(engine: Engine);
}

export interface EngineStore {
  register(engine: Engine);
  unregister(engine: Engine);
}