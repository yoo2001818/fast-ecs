import { EngineIndex, EngineStore, EngineSystem } from './type';
import Signal from './signal';

export default class Engine {
  signals: Map<string, Signal<unknown>>;
  indexes: { [key: string]: unknown };
  store: { [key: string]: unknown };
  systems: { [key: string]: unknown };
  systemList: unknown[];

  constructor() {
    this.signals = new Map();
    this.indexes = {};
    this.store = {};
    this.systems = {};
    this.systemList = [];
  }

  getSignal<T>(name: string): Signal<T> {
    let signal = this.signals.get(name);
    if (signal == null) {
      signal = new Signal<T>();
      this.signals.set(name, signal);
    }
    return signal as Signal<T>;
  }

  addIndex(name: string, value: EngineIndex): void {
    this.indexes[name] = value;
    value.register(this);
  }

  addStore(name: string, value: EngineStore): void {
    this.store[name] = value;
    value.register(this);
  }

  addSystem(name: string, init: (engine: Engine) => EngineSystem): void {
    const system = init(this);
    this.systems[name] = system;
    this.systemList.push(system);
  }

  getIndex<T>(name: string): T {
    return this.indexes[name] as T;
  }

  getStore<T>(name: string): T {
    return this.store[name] as T;
  }

  getSystem<T>(name: string): T {
    return this.systems[name] as T;
  }

  update(): void {
    this.systemList.forEach((v) => (v as EngineSystem)());
  }
}
