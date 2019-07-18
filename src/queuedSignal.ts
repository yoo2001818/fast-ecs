
export default class QueuedSignal<T> {
  immediateListeners: ((event: T) => void)[] = [];
  listeners: ((events: T[]) => void)[] = [];
  queue: T[] = [];
  addImmediate(listener: (event: T) => void): void {
    this.immediateListeners.push(listener);
  }
  removeImmediate(listener: (event: T) => void): void {
    this.immediateListeners =
      this.immediateListeners.filter(v => v !== listener);
  }
  add(listener: (event: T[]) => void): void {
    this.listeners.push(listener);
  }
  remove(listener: (event: T[]) => void): void {
    this.listeners = this.listeners.filter(v => v !== listener);
  }
  emit(event: T): void {
    this.immediateListeners.forEach(listener => listener(event));
    this.queue.push(event);
  }
  flush(): void {
    this.listeners.forEach(listener => listener(this.queue));
    this.queue.length = 0;
  }
  isQueued(): boolean {
    return this.queue.length > 0;
  }
}
