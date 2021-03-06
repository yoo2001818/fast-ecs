import RedBlackSortedMap from './sortedMap/rb';
import { ComponentStore } from './type';
import Engine from './engine';
import Signal from './signal';

export default class RBComponentStore<T> implements ComponentStore<T> {
  name: string;
  sortedMap: RedBlackSortedMap<number, T>;
  engine: Engine;
  addedSignal: Signal<number>;
  removedSignal: Signal<number>;
  changedSignal: Signal<number>;
  constructor(name: string) {
    this.sortedMap = new RedBlackSortedMap((a, b) => a - b);
    this.name = name;
  }

  get(id: number): T | undefined {
    return this.sortedMap.get(id);
  }

  set(id: number, value: T): void {
    const hadEntry = this.sortedMap.has(id);
    this.sortedMap.set(id, value);
    if (hadEntry) {
      this.changedSignal.emit(this.name, id);
    } else {
      this.addedSignal.emit(this.name, id);
    }
  }

  delete(id: number): void {
    this.sortedMap.delete(id);
    this.removedSignal.emit(this.name, id);
  }

  register(engine: Engine): void {
    this.engine = engine;
    this.addedSignal = engine.getSignal<number>('componentAdded');
    this.removedSignal = engine.getSignal<number>('componentRemoved');
    this.changedSignal = engine.getSignal<number>('componentChanged');
  }

  unregister(): void {
  }
}
