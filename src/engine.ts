import { EngineIndex, EngineStore } from './type';
import Signal from './signal';

export default class Engine {
  signals: Map<string, Signal<unknown>>;
  indexes: { [key: string]: unknown };
  store: { [key: string]: unknown };

  constructor() {
    this.signals = new Map();
    this.indexes = {};
    this.store = {};
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

  getIndex<T>(name: string): T {
    return this.indexes[name] as T;
  }

  getStore<T>(name: string): T {
    return this.store[name] as T;
  }
}
