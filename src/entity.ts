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
      this.engine.getSignal('entity', 'componentAdd')
        .emit({ entity: this, componentId })
    }
  }

  remove(name: string) {
    const componentId = this.engine.components.indexOf(name);
    const componentState = this.engine.state[componentId];
    const hadBefore = componentState[this.id] !== undefined;
    componentState[this.id] = undefined;
    if (hadBefore) {
      this.engine.getSignal('entity', 'componentRemove')
        .emit({ entity: this, componentId })
    }
  }

  removeEntity() {
    this.engine.getComponentState('epoch')[this.id] += 1;
    this.engine.getSignal('entity', 'entityRemove')
      .emit({ entity: this });
  }
}
