import BitSet from './bitSet';
import { EngineIndex } from './type';
import Engine from './engine';

export default class ComponentIndex extends BitSet implements EngineIndex {
  name: string;
  engine: Engine;
  constructor(name: string) {
    super();
    this.name = name;
    this.engine = null;
    this.handleAdded = this.handleAdded.bind(this);
    this.handleRemoved = this.handleRemoved.bind(this);
  }

  handleAdded(name: string, id: number): void {
    this.set(id, true);
  }

  handleRemoved(name: string, id: number): void {
    this.set(id, false);
  }

  register(engine: Engine): void {
    this.engine = engine;
    this.engine.getSignal('componentAdded').addListener(
      this.name, this.handleAdded,
    );
    this.engine.getSignal('componentRemoved').addListener(
      this.name, this.handleRemoved,
    );
  }

  unregister(): void {
    this.engine.getSignal('componentAdded').removeListener(
      this.name, this.handleAdded,
    );
    this.engine.getSignal('componentRemoved').removeListener(
      this.name, this.handleRemoved,
    );
    this.engine = null;
  }
}
