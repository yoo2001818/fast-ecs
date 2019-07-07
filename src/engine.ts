import { Component, System } from './type';
import QuerySystem from './querySystem';
import Registry from './registry';
import Entity from './entity';
import Channel from './channel';

type ComponentFactory = (...args: any[]) => Component;

export default class Engine {
  components: Registry<ComponentFactory> = new Registry();
  systems: { [key: string]: System } = {};
  channels: { [key: string]: Channel<any> } = {};

  state: Component[][] = [];
  maxEntityId: number = 0;

  constructor() {
    this.addComponent('epoch', (epoch: number) => epoch);
    this.addSystem('query', () => new QuerySystem(this));
  }
  
  addComponent(name: string, componentFactory: ComponentFactory) {
    this.components.set(name, componentFactory);
  }

  addSystem(name: string, system: (engine: Engine) => System) {
    this.systems[name] = system(this);
  }

  getChannel(name: string) {
    if (this.channels[name] == null) this.channels[name] = new Channel();
    return this.channels[name];
  }

  init() {
    let componentsSize = this.components.values.length;
    this.state = new Array(componentsSize);
    for (let i = 0; i < componentsSize; i += 1) {
      this.state[i] = [];
    }
  }
  
  createEntity() {
    const epoches = this.getComponentState('epoch');
    const id = this.maxEntityId;
    const epoch = (epoches[id] || 0) + 1;
    epoches[id] = epoch;
    this.maxEntityId += 1;
    return new Entity(this, id, epoch);
  }

  getComponentState(name: string) {
    return this.state[this.components.indexOf(name)];
  }
}
