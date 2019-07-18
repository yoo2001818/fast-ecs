export default class Signal<T> {
  listeners: ((event: T) => void)[] = [];
  add(listener: (event: T) => void): void {
    this.listeners.push(listener);
  }
  remove(listener: (event: T) => void): void {
    this.listeners = this.listeners.filter(v => v !== listener);
  }
  emit(event: T): void {
    this.listeners.forEach(listener => listener(event));
  }
}
