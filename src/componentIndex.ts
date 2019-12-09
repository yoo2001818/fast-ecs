import BitSet from './bitSet';
import { Engine, EngineIndex } from './type';

export default class ComponentIndex extends BitSet implements EngineIndex {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  register(engine: Engine): void {

  }

  unregister(): void {

  }
}
