import BitSet from './bitSet';
import { EngineIndex } from './type';
import Engine from './engine';

export default class ComponentChangedIndex implements EngineIndex {
  name: string;
  engine: Engine;
  constructor(name: string) {
    this.name = name;
    this.handleAdded = this.handleAdded.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
    this.handleRemoved = this.handleRemoved.bind(this);
  }

  handleAdded(name: string, id: number): void {
  }

  handleChanged(name: string, id: number): void {
  }

  handleRemoved(name: string, id: number): void {
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
    // Component changed index needs to manage two different sets; one for
    // previous frame and one for next frame. We use swap chain for this.
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
  }
}
