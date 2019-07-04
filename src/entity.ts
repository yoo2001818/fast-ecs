import Engine from './engine';

export default class Entity {
  engine: Engine;
  id: number;
  epoch: number;

  constructor(engine: Engine, id: number, epoch: number) {
    this.engine = engine;
    this.id = id;
    this.epoch = epoch;
  }

  isAlive(): boolean {
    return this.engine.getComponentState('epoch')[this.id] === this.epoch;
  }
}
