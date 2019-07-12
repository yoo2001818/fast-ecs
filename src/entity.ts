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

  get(name: string) {
    const componentState = this.engine.getComponentState(name);
    return componentState[this.id];
  }

  set(name: string, value: any) {
    const componentId = this.engine.components.indexOf(name);
    const componentState = this.engine.state[componentId];
    const hadBefore = componentState[this.id] !== undefined;
    componentState[this.id] = value;
    if (!hadBefore) {
      this.engine.getChannel('componentAdded')
        .emit({ entity: this, componentId })
    }
  }
}
