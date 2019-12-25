import {
  EngineIndex,
  EngineStore,
  EngineSystem,
  EngineHelper,
  ComponentStore,
} from './type';
import Signal from './signal';

export default class Engine {
  signals: Map<string, Signal<unknown>>;
  indexes: { [key: string]: unknown };
  store: { [key: string]: unknown };
  storeNames: string[];
  componentStores: { [key: string]: unknown };
  componentStoreNames: string[];
  helpers: { [key: string]: unknown };
  systems: { [key: string]: unknown };
  systemList: unknown[];

  constructor() {
    this.signals = new Map();
    this.indexes = {};
    this.store = {};
    this.storeNames = [];
    this.componentStores = {};
    this.componentStoreNames = [];
    this.helpers = {};
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
    this.storeNames.push(name);
    value.register(this);
  }

  addComponentStore(name: string, value: ComponentStore<unknown>): void {
    this.componentStores[name] = value;
    this.componentStoreNames.push(name);
    this.addStore(name, value);
  }

  addHelper(name: string, value: EngineHelper): void {
    this.helpers[name] = value;
    value.register(this);
  }

  addSystem(name: string, value: EngineSystem): void {
    this.systems[name] = value;
    this.systemList.push(value);
    value.register(this);
  }

  getIndex<T>(name: string): T {
    return this.indexes[name] as T;
  }

  getStore<T>(name: string): T {
    return this.store[name] as T;
  }

  getComponentStore<T = ComponentStore<unknown>>(name: string): T {
    return this.componentStores[name] as T;
  }

  getHelper<T>(name: string): T {
    return this.helpers[name] as T;
  }

  getSystem<T>(name: string): T {
    return this.systems[name] as T;
  }

  update(): void {
    this.getSignal('update').emit(null, null);
    this.getSignal('afterUpdate').emit(null, null);
  }
}
