import BitSet from './bitSet';
import { EngineIndex } from './type';
import Engine from './engine';

export const ADDED = 1;
export const REMOVED = 2;
export const CHANGED = 3;

export default class ComponentChangedIndex implements EngineIndex {
  name: string;
  engine: Engine;
  added: BitSet;
  removed: BitSet;
  constructor(name: string) {
    this.name = name;
    this.handleAdded = this.handleAdded.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
    this.handleRemoved = this.handleRemoved.bind(this);
    this.handleBeforeUpdate = this.handleBeforeUpdate.bind(this);
    this.added = new BitSet();
    this.removed = new BitSet();
  }

  get(id: number): number {
    return (this.added.get(id) ? 1 : 0) + (this.removed.get(id) ? 2 : 0);
  }

  entries(): IterableIterator<[number, number]> {
    const addedIter = this.added[Symbol.iterator]();
    const removedIter = this.removed[Symbol.iterator]();
    let addedDone = false;
    let removedDone = false;
    const iter: IterableIterator<[number, number]> = {
      next() {
        if (addedDone && removedDone) {
          return { done: true, value: undefined };
        }
        if (addedDone) {
          const result = removedIter.next();
          if (result.done) {
            removedDone = true;
            return { done: true, value: undefined };
          }
          return { done: false, value: [result.value, REMOVED] };
        }
        if (removedDone) {
          const result = addedIter.next();
          if (result.done) {
            addedDone = true;
            return { done: true, value: undefined };
          }
          return { done: false, value: [result.value, ADDED] };
        }
        const removedResult = removedIter.next();
        const addedResult = addedIter.next();
        if (!removedResult.done) {
          if (!addedResult.done && addedResult.value === removedResult.value) {
            return { done: false, value: [addedResult.value, CHANGED] };
          }
          addedDone = true;
          return { done: false, value: [removedResult.value, REMOVED] };
        }
        removedDone = true;
        if (!addedResult.done) {
          addedDone = true;
          return { done: false, value: [addedResult.value, ADDED] };
        }
        return { done: true, value: undefined };
      },
      [Symbol.iterator]() {
        return iter;
      },
    };
    return iter;
  }

  forEach(
    callbackfn: (id: number, flag: number) => void,
  ): void {
    for (const [key, value] of this.entries()) {
      callbackfn(key, value);
    }
  }

  handleAdded(name: string, id: number): void {
    this.added.set(id, true);
  }

  handleChanged(name: string, id: number): void {
    this.added.set(id, true);
    this.removed.set(id, true);
  }

  handleRemoved(name: string, id: number): void {
    this.removed.set(id, true);
  }

  handleBeforeUpdate(): void {
    this.added.clear();
    this.removed.clear();
  }

  register(engine: Engine): void {
    this.engine = engine;
    this.engine.getSignal('componentAdded').addListener(
      this.name, this.handleAdded,
    );
    this.engine.getSignal('componentChanged').addListener(
      this.name, this.handleChanged,
    );
    this.engine.getSignal('componentRemoved').addListener(
      this.name, this.handleRemoved,
    );
    this.engine.getSignal('beforeUpdate').addListener(
      null, this.handleBeforeUpdate,
    );
  }

  unregister(): void {
    this.engine.getSignal('componentAdded').removeListener(
      this.name, this.handleAdded,
    );
    this.engine.getSignal('componentChanged').removeListener(
      this.name, this.handleChanged,
    );
    this.engine.getSignal('componentRemoved').removeListener(
      this.name, this.handleRemoved,
    );
    this.engine.getSignal('beforeUpdate').removeListener(
      null, this.handleBeforeUpdate,
    );
  }
}
