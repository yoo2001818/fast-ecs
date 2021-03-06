import Engine from './engine';
import { ComponentStore } from './type';
import Signal from './signal';
import BitSet from './bitSet';

export default class IdStore implements ComponentStore<boolean> {
  bitSet: BitSet;
  maxId: number = 0;
  engine: Engine;
  addedSignal: Signal<number>;
  removedSignal: Signal<number>;

  constructor() {
    this.bitSet = new BitSet();
    this.maxId = 0;
  }

  create(): number {
    const newId = this.maxId;
    this.maxId += 1;
    this.set(newId, true);
    return newId;
  }

  get(id: number): boolean {
    return this.bitSet.get(id);
  }

  delete(id: number): void {
    this.set(id, false);
  }

  set(id: number, value: boolean): void {
    const prevValue = this.has(id);
    this.bitSet.set(id, value);
    if (prevValue && !value) {
      this.removedSignal.emit('', id);
    } else if (!prevValue && value) {
      this.addedSignal.emit('', id);
    }
  }

  has(id: number): boolean {
    return this.bitSet.has(id);
  }

  register(engine: Engine): void {
    this.engine = engine;
    this.addedSignal = engine.getSignal('entityAdded');
    this.removedSignal = engine.getSignal('entityRemoved');
  }

  unregister(): void {
  }
}
