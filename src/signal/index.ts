
export interface Signal<T> {
  emit(value: T): void,
  
  addListener(listener: (value: T) => void): void,
  removeListener(listener: (value: T) => void): void,
}
