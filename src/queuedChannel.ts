import Channel from './channel';

export default class QueuedChannel<T> extends Channel<T> {
  immediateListeners: ((event: T) => void)[] = [];
  queue: T[] = [];
  constructor() {
    super();
  }
  addImmediate(listener: (event: T) => void): void {
    this.immediateListeners.push(listener);
  }
  removeImmediate(listener: (event: T) => void): void {
    this.immediateListeners =
      this.immediateListeners.filter(v => v !== listener);
  }
  emit(event: T): void {
    this.immediateListeners.forEach(listener => listener(event));
    this.queue.push(event);
  }
  flush(): void {
    this.queue.forEach(event => {
      this.listeners.forEach(listener => listener(event));
    });
    this.queue.length = 0;
  }
  isQueued(): boolean {
    return this.queue.length > 0;
  }
}
