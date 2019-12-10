import Signal from './signal';

export default class Engine {
  signals: Map<string, Signal<unknown>>;
  constructor() {
    this.signals = new Map();
  }

  getSignal<T>(name: string): Signal<T> {
    let signal = this.signals.get(name);
    if (signal == null) {
      signal = new Signal<T>();
      this.signals.set(name, signal);
    }
    return signal as Signal<T>;
  }
}