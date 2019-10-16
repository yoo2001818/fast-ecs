export default class BitSet implements Set<number> {
  size: number;
  cardinality: number;
  length: number;
  pages: Int32Array[] = [];

  clear(): void {
    throw new Error("Method not implemented.");
  }
  set(key: number, value: boolean): this {
    let byte = key / 32 | 0;
    let pos = key % 32;
    let pageId = byte / 1024 | 0;
    let pageOffset = byte % 1024;
    if (this.pages[pageId] == null) {
      this.pages[pageId] = new Int32Array(1024);
    }
    this.pages[pageId][pageOffset] |= 1 << (pos - 1);
    return this;
  }
  add(value: number): this {
    return this.set(value, true);
  }
  delete(value: number): boolean {
    this.set(value, false);
    // TODO Check if bit was true
    return true;
  }
  forEach(callbackfn: (value: number, value2: number, set: Set<number>) => void, thisArg?: any): void {
    throw new Error("Method not implemented.");
  }
  has(value: number): boolean {
    throw new Error("Method not implemented.");
  }
  [Symbol.iterator](): IterableIterator<number> {
    throw new Error("Method not implemented.");
  }
  entries(): IterableIterator<[number, number]> {
    throw new Error("Method not implemented.");
  }
  keys(): IterableIterator<number> {
    throw new Error("Method not implemented.");
  }
  values(): IterableIterator<number> {
    throw new Error("Method not implemented.");
  }
  [Symbol.toStringTag]: string = 'BitSet';
  and(set: BitSet): BitSet {
    throw new Error("Method not implemented.");
  }
  andNot(set: BitSet): BitSet {
    throw new Error("Method not implemented.");
  }
  or(set: BitSet): BitSet {
    throw new Error("Method not implemented.");
  }
  xor(set: BitSet): BitSet {
    throw new Error("Method not implemented.");
  }
}
