import Entity from './entity';

export interface EntityEvent {
  entity: Entity,
}

export default class EntitySignal<T extends EntityEvent> {
  immediateListeners: ((event: T) => void)[] = [];
  listeners: ((events: T[]) => void)[] = [];
  queue: T[] = [];
  onQueued: (signal: EntitySignal<T>) => void | null = null;
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
    if (this.queue.length === 1 && this.onQueued) {
      this.onQueued(this);
    }
  }
  flush(): void {
    this.listeners.forEach(listener => listener(this.queue));
    this.queue.length = 0;
  }
  isQueued(): boolean {
    return this.queue.length > 0;
  }
}
