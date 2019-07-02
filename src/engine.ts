import { Component, System } from './type';
import QuerySystem from './querySystem';

type ComponentFactory = () => Component;

interface ComponentMetadata {
  create: (...props: unknown[]) => Component,
  position: number,
}

export default class Engine {
  components: { [key: string]: ComponentMetadata } = {};
  componentCount: number = 0;
  systems: { [key: string]: System } = {};
  state: Component[][] = [];

  constructor() {
    this.addSystem('query', new QuerySystem(this));
  }
  
  addComponent(name: string, componentFactory: ComponentFactory) {
    this.components[name] = {
      create: componentFactory,
      position: this.componentCount,
    };
    this.componentCount += 1;
  }

  addSystem(name: string, system: System) {
    this.systems[name] = system;
  }

  init() {

  }
}
