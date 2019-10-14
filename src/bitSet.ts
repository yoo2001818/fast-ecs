export default class BitSet implements Set<number> {
  size: number;
  cardinality: number;
  length: number;

  add(value: number): this {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
  delete(value: number): boolean {
    throw new Error("Method not implemented.");
  }
  set(key: number, value: boolean): this {
    throw new Error("Method not implemented.");
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
  [Symbol.toStringTag]: string;
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
