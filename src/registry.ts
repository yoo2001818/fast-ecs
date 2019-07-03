export default class Registry<T> {
  indexMap: { [key: string]: number } = {};
  values: T[] = [];

  set(key: string, value: T): number {
    const index = this.values.length;
    this.values.push(value);
    this.indexMap[key] = index;
    return index;
  }

  delete(key: string): void {
    delete this.indexMap[key];
  }

  get(key: string): T | null {
    const index = this.indexMap[key];
    if (index == null) return null;
    return this.values[index];
  }

  getIndex(index: number): T | null {
    return this.values[index];
  }

  indexOf(key: string): number | null {
    return this.indexMap[key];
  }
}
