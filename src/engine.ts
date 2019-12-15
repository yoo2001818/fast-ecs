import { EngineIndex, EngineStore, EngineSystem } from './type';
import Signal from './signal';

export default class Engine {
  signals: Map<string, Signal<unknown>>;
  indexes: { [key: string]: unknown };
  store: { [key: string]: unknown };
  systems: EngineSystem[];

  constructor() {
    this.signals = new Map();
    this.indexes = {};
    this.store = {};
    this.systems = [];
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
    this.systems.push(init(this));
  }

  getIndex<T>(name: string): T {
    return this.indexes[name] as T;
  }

  getStore<T>(name: string): T {
    return this.store[name] as T;
  }

  update(): void {
    this.systems.forEach((v) => v());
  }
}
