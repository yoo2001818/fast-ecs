import BitSet from './bitSet';
import { EngineIndex } from './type';
import Engine from './engine';

export default class ComponentIndex extends BitSet implements EngineIndex {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  register(engine: Engine): void {
    engine.getSignal('componentAdded').addListener(null, () => {

    });
  }

  unregister(): void {

  }
}
