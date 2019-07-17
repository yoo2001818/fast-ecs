import { Component, System } from './type';
import QuerySystem from './querySystem';
import Registry from './registry';
import Entity from './entity';
import EntityChannel from './entityChannel';
import Channel from './channel';
import QueuedChannel from './queuedChannel';

type ComponentFactory = (...args: any[]) => Component;

export default class Engine {
  components: Registry<ComponentFactory> = new Registry();
  systems: { [key: string]: System } = {};
  globalChannels: { [key: string]: Channel<any> } = {};
  entityChannels: { [key: string]: EntityChannel<any> } = {};
  eventChannels: { [key: string]: QueuedChannel<any> } = {};

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

  getChannel(type: 'global', name: string): Channel<any>;
  getChannel(type: 'entity', name: string): EntityChannel<any>;
  getChannel(type: 'event', name: string): QueuedChannel<any>;
  getChannel(type: 'global' | 'entity' | 'event', name: string) {
    switch (type) {
      case 'global':
        if (this.globalChannels[name] == null) {
          this.globalChannels[name] = new Channel();
        }
        return this.globalChannels[name];
      case 'entity':
        if (this.entityChannels[name] == null) {
          this.entityChannels[name] = new EntityChannel();
        }
        return this.entityChannels[name];
      case 'event':
        if (this.eventChannels[name] == null) {
          this.eventChannels[name] = new QueuedChannel();
        }
        return this.eventChannels[name];
    }
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
    const entity = new Entity(this, id, epoch);
    this.getChannel('entity', 'entityAdded').emit({ entity });
    return entity;
  }

  getComponentState(name: string) {
    return this.state[this.components.indexOf(name)];
  }
}
