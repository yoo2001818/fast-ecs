export default class BitSet implements Set<number> {
  size: number;
  cardinality: number;
  length: number;
  pages: Int32Array[] = [];

  _getPage(pageId: number): Int32Array {
    let page = this.pages[pageId];
    if (page == null) this.pages[pageId] = page = new Int32Array(1024);
    return page;
  }
  _getPageIfExists(pageId: number): Int32Array | null {
    let page = this.pages[pageId];
    return page;
  }

  clear(): void {
    this.pages = [];
  }
  set(key: number, value: boolean): this {
    const byte = key >> 5;
    const pos = key & 31;
    const pageId = byte >> 10;
    const pageOffset = byte & 1023;
    const page = this._getPage(pageId);
    if (value) page[pageOffset] |= 1 << pos;
    else page[pageOffset] &= ~(1 << pos);
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
  has(key: number): boolean {
    return this.get(key);
  }
  get(key: number): boolean {
    const byte = key >> 5;
    const pos = key & 31;
    const pageId = byte >> 10;
    const pageOffset = byte & 1023;
    const page = this._getPageIfExists(pageId);
    if (page == null) return false;
    return (page[pageOffset] & (1 << pos)) !== 0;
  }
  [Symbol.iterator](): IterableIterator<number> {
    throw new Error("Method not implemented.");
  }
  forEach(callbackfn: (value: number, value2: number, set: Set<number>) => void, thisArg?: any): void {
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
