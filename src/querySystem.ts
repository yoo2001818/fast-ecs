import Engine from './engine';
import Entity from './entity';

export class Query {
  entities: Entity[] = [];
  idPattern: number[];
  componentPattern: string[];
  refCount: number = 0;
  constructor(idPattern: number[], componentPattern: string[]) {
    this.idPattern = idPattern;
    this.componentPattern = componentPattern;
  }
}

export default class QuerySystem {
  engine: Engine;
  queries: Query[] = [];
  componentQueries: Query[][] = [];
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.getChannel('componentAdd')
      .addImmediate(this.handleComponentAdd);
    this.engine.getChannel('componentRemove')
      .addImmediate(this.handleComponentRemove);
    this.engine.getChannel('entityRemove')
      .addImmediate(this.handleEntityRemove);
  }
  getQuery(pattern: string[]) {
    const ids = pattern.map(v => this.engine.components.indexOf(v));
    ids.sort((a, b) => a - b);
    const query = new Query(ids, pattern);
    this.queries.push(query);
    // Put the query onto component queries; we can use any component in the
    // query, preferably with least number of entities. However, such data is
    // not present yet, therefore using the highest one should suffice.
    const chosenId = ids[ids.length - 1];
    if (this.componentQueries[chosenId] == null) {
      this.componentQueries[chosenId] = [];
    }
    this.componentQueries[chosenId].push(query);
    return query;
  }
  handleComponentAdd = (event: { entity: Entity, componentId: number }) => {
    const { entity, componentId } = event;

  };
  handleComponentRemove = (entity: { entity: Entity, componentId: number }) => {

  };
  handleEntityRemove = (entity: Entity) => {

  };
}
