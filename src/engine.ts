import { Component, System } from './type';
import QuerySystem from './querySystem';
import Registry from './registry';
import Entity from './entity';
import EntitySignal from './entitySignal';
import Signal from './signal';
import QueuedSignal from './queuedSignal';

type ComponentFactory = (...args: any[]) => Component;

export default class Engine {
  components: Registry<ComponentFactory> = new Registry();
  systems: { [key: string]: System } = {};
  globalSignals: { [key: string]: Signal<any> } = {};
  entitySignals: { [key: string]: EntitySignal<any> } = {};
  eventSignals: { [key: string]: QueuedSignal<any> } = {};

  state: Component[][] = [];
  maxEntityId: number = 0;
  signalQueue: (QueuedSignal<any> | EntitySignal<any>)[] = [];

  constructor() {
    this.addComponent('entity', (entity: Entity) => entity);
    this.addComponent('epoch', (epoch: number) => epoch);
    this.addSystem('query', () => new QuerySystem(this));
  }
  
  addComponent(name: string, componentFactory: ComponentFactory) {
    this.components.set(name, componentFactory);
  }

  addSystem(name: string, system: (engine: Engine) => System) {
    this.systems[name] = system(this);
  }

  getSignal(type: 'global', name: string): Signal<any>;
  getSignal(type: 'entity', name: string): EntitySignal<any>;
  getSignal(type: 'event', name: string): QueuedSignal<any>;
  getSignal(type: 'global' | 'entity' | 'event', name: string) {
    switch (type) {
      case 'global':
        if (this.globalSignals[name] == null) {
          let result = new Signal();
          this.globalSignals[name] = result;
          return result;
        }
        return this.globalSignals[name];
      case 'entity':
        if (this.entitySignals[name] == null) {
          let result = new EntitySignal();
          result.onQueued = () => this.addSignalQueue(result);
          this.entitySignals[name] = result;
          return result;
        }
        return this.entitySignals[name];
      case 'event':
        if (this.eventSignals[name] == null) {
          let result = new QueuedSignal();
          result.onQueued = () => this.addSignalQueue(result);
          this.eventSignals[name] = result;
          return result;
        }
        return this.eventSignals[name];
    }
  }

  addSignalQueue(signal: QueuedSignal<any> | EntitySignal<any>) {
    this.signalQueue.push(signal);
  }

  init() {
    let componentsSize = this.components.values.length;
    this.state = new Array(componentsSize);
    for (let i = 0; i < componentsSize; i += 1) {
      this.state[i] = [];
    }
  }

  update() {
    this.getSignal('global', 'update').emit(null);
    this.signalQueue.forEach((v) => v.flush());
    this.signalQueue.length = 0;
  }
  
  createEntity() {
    const epoches = this.getComponentState('epoch');
    const id = this.maxEntityId;
    const epoch = (epoches[id] || 0) + 1;
    epoches[id] = epoch;
    this.maxEntityId += 1;
    const entity = new Entity(this, id, epoch);
    this.getSignal('entity', 'entityAdded').emit({ entity });
    this.getComponentState('entity')[id] = entity;
    return entity;
  }

  getComponentState(name: string) {
    return this.state[this.components.indexOf(name)];
  }
}
