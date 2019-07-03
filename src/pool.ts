export default class Pool<T> {
  stack: T[];
  creator: () => T;
  length: number;
  maxSize: number;
  
  constructor(creator: () => T, maxSize: number = 100) {
    this.creator = creator;
    this.stack = new Array(maxSize);
    this.length = 0;
    this.maxSize = maxSize;
  }

  get(): T {
    if (this.length > 0) {
      this.length -= 1;
      return this.stack[this.length];
    }
    return this.creator();
  }

  put(value: T): void {
    // Do nothing if already full
    if (this.length > this.maxSize) return;
    this.stack[this.length] = value;
    this.length += 1;
  }
}
