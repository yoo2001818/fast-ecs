export type SignalListener<T> = (key: string, value: T) => void;

export default class Signal<T> {
  keyListeners: { [key: string]: Set<SignalListener<T>> };
  listeners: Set<SignalListener<T>>;

  constructor() {
    this.keyListeners = {};
    this.listeners = new Set();
  }

  addListener(key: string | null, callback: SignalListener<T>): void {
    if (key == null) {
      this.listeners.add(callback);
    } else {
      if (this.keyListeners[key] == null) this.keyListeners[key] = new Set();
      this.keyListeners[key].add(callback);
    }
  }
  removeListener(key: string | null, callback: SignalListener<T>): void {
    if (key == null) {
      this.listeners.delete(callback);
    } else if (this.keyListeners[key] != null) {
      this.keyListeners[key].delete(callback);
    }
  }

  emit(key: string, value: T): void {
    this.listeners.forEach(v => v(key, value));
    let keyListeners = this.keyListeners[key];
    if (keyListeners != null) {
      keyListeners.forEach(v => v(key, value));
    }
  }
}
