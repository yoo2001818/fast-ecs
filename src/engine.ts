import { Component, System } from './type';
import QuerySystem from './querySystem';
import Registry from './registry';

type ComponentFactory = () => Component;

export default class Engine {
  components: Registry<ComponentFactory> = new Registry();
  systems: { [key: string]: System } = {};

  state: Component[][] = [];
  maxEntityId: number = 0;

  constructor() {
    this.addSystem('query', new QuerySystem(this));
  }
  
  addComponent(name: string, componentFactory: ComponentFactory) {
    this.components.set(name, componentFactory);
  }

  addSystem(name: string, system: System) {
    this.systems[name] = system;
  }

  init() {
    let componentsSize = this.components.values.length;
    this.state = new Array(componentsSize);
    for (let i = 0; i < componentsSize; i += 1) {
      this.state[i] = [];
    }
  }
  
  createEntity() {

  }
}
