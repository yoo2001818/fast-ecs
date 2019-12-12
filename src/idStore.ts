import { Engine } from './engine';
import { EngineStore } from './type';
import BitSet from './bitSet';

export default class IdStore extends BitSet implements EngineStore {
  maxId: number = 0;
  constructor() {
    super();
    this.maxId = 0;
  }

  create(): number {
    let newId = this.maxId;
    this.maxId += 1;
    this.add(newId);
    return newId;
  }

  register(engine: Engine): void {
  }

  unregister(): void {
  }
}

