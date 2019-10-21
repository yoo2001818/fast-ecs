export default class BitSet implements Set<number> {
  size: number;
  cardinality: number;
  length: number;
  pages: Int32Array[] = [];
  // Skip bitset; inspired from https://github.com/amethyst/hibitset
  // Each layer should contain 4 values from previous buffer.
  // Layer 3: --------------------------------------1
  // Layer 2: ------------------1 ------------------0
  // Layer 1: ---0 ---1 ---0 ---0 ---0 ---0 ---0 ---0
  // Layer 0: 0000 0001 0000 0000 0000 0000 0000 0000
  // Layer 0 is stored inside 'pages', and other layers are considered
  // 'indexes'.
  // Layer 0 is 4096 bytes.
  // Layer 1 is 1024 bytes.
  // Layer 2 is 256 bytes.
  // Layer 3 is 64 bytes.
  skipPages: Int32Array[] = [];

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
  *entries(): IterableIterator<[number, number]> {
    for (let value of this.values()) {
      yield [value, value];
    }
  }
  keys(): IterableIterator<number> {
    return this.values();
  }
  *values(): IterableIterator<number> {
    for (let i = 0; i < this.pages.length; i += 1) {
      const page = this.pages[i];
      for (let j = 0; j < page.length; j += 1) {
        let value = page[j];
        let pos = 0;
        while (value !== 0) {
          if (value & 1) yield pos + j * 32 + i * 1024 * 32;
          pos += 1;
          value >>= 1;
        }
      }
    }
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
