export interface QueuedSignal<T> {
  hasQueue(): boolean,
  flush(): void,
  emit(value: T): void,
  
  addListener(listener: (value: T) => void): void,
  removeListener(listener: (value: T) => void): void,

  addImmediateListener(listener: (value: T) => void): void,
  removeImmediateListener(listener: (value: T) => void): void,

  addQueuedListener(listener: () => void): void,
  removeQueuedListener(listener: () => void): void,
}
