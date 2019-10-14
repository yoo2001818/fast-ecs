export default class Signal<T> {
  addListener(
    key: string | null,
    callback: (key: string, value: T) => void,
  ): void {
    throw new Error("Method not implemented.");
  }
  removeListener(
    key: string | null,
    callback: (key: string, value: T) => void,
  ): void {
    throw new Error("Method not implemented.");
  }

  emit(key: string, value: T): void {
    throw new Error("Method not implemented.");
  }
}
