import Engine from './engine';
import Entity from './entity';

export class Query {
  entityIds: number[] = [];
  idPattern: number[];
  componentPattern: string[];
  refCount: number = 0;
  constructor(idPattern: number[], componentPattern: string[]) {
    this.idPattern = idPattern;
    this.componentPattern = componentPattern;
  }
  add(id: number): void {
    this.entityIds.push(id);
  }
  remove(id: number): void {
    // TODO This is horribly inefficient...
    this.entityIds = this.entityIds.filter(v => v !== id);
  }
}

export default class QuerySystem {
  engine: Engine;
  queries: Query[] = [];
  componentQueriesExclusive: Query[][] = [];
  componentQueriesInclusive: Query[][] = [];
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
    {
      const chosenId = ids[ids.length - 1];
      let list = this.componentQueriesExclusive[chosenId];
      if (list == null) {
        list = this.componentQueriesExclusive[chosenId] = [];
      }
      list.push(query);
    }
    ids.forEach(id => {
      let list = this.componentQueriesInclusive[id];
      if (list == null) {
        list = this.componentQueriesInclusive[id] = [];
      }
      list.push(query);
    });
    return query;
  }
  handleComponentAdd = (event: { entity: Entity, componentId: number }) => {
    const { entity, componentId } = event;
    const queries = this.componentQueriesExclusive[componentId];
    const state = this.engine.state;
    queries.forEach(query => {
      // Check if all components are given for the given query.
      const matched = query.idPattern.every(id =>
        state[id][entity.id] !== undefined);
      if (matched) {
        query.add(entity.id);
      }
    });
  };
  handleComponentRemove = (event: { entity: Entity, componentId: number }) => {
    const { entity, componentId } = event;
    const queries = this.componentQueriesInclusive[componentId];
    const state = this.engine.state;
    queries.forEach(query => {
      // Check if the entity matches with all components... except one.
      const matched = query.idPattern.every(id =>
        id === componentId || state[id][entity.id] !== undefined);
      if (matched) {
        query.remove(entity.id);
      }
    });
  };
  handleEntityRemove = (entity: Entity) => {
    // This assumes that entity retains component information even it gets
    // removed...
    const state = this.engine.state;
    this.queries.forEach(query => {
      const matched = query.idPattern.every(id =>
        state[id][entity.id] !== undefined);
      if (matched) {
        query.remove(entity.id);
      }
    });
  };
}
