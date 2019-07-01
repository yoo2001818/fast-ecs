import { Component, System } from './type';
import State from './state';
import QuerySystem from './querySystem';

export default class Engine {
  components: { [key: string]: Component } = {};
  systems: { [key: string]: System } = {};
  state: State;

  constructor() {
    this.addComponent('query', new QuerySystem(this));
  }
  
  addComponent(name: string, component: Component) {
    this.components[name] = component;
  }

  addSystem(name: string, system: System) {
    this.systems[name] = system;
  }

  init() {

  }
}
