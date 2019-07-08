import Engine from './engine';
import Entity from './entity';

export class Query {
  entities: Entity[] = [];
  refCount: number = 0;
}

export default class QuerySystem {
  engine: Engine;
  queries: Query[] = [];
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.getChannel('entityAdded').addImmediate(this.handleAdd);
    this.engine.getChannel('entityRemoved').addImmediate(this.handleRemove);
  }
  getQuery(patterns: string[]) {

  }
  handleAdd = (entity: Entity) => {

  };
  handleRemove = (entity: Entity) => {

  };
}
