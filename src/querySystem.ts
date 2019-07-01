import Engine from './engine';

export default class QuerySystem {
  engine: Engine;
  constructor(engine: Engine) {
    this.engine = engine;
  }
}
