import { EngineIndex, EngineStore } from './type';
import Signal from './signal';

export default class Engine {
  signals: Map<string, Signal<unknown>>;
  indexes: { [key: string]: EngineIndex };
  store: { [key: string]: EngineStore };

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
}