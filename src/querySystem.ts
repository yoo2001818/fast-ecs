import Engine from './engine';
import Entity from './entity';
import EntitySignal from './entitySignal';

export class Query {
  list: Entity[] = [];
  idPattern: number[];
  componentPattern: string[];
  refCount: number = 0;
  added: EntitySignal<{ entity: Entity }> = new EntitySignal();
  removed: EntitySignal<{ entity: Entity }> = new EntitySignal();
  constructor(idPattern: number[], componentPattern: string[]) {
    this.idPattern = idPattern;
    this.componentPattern = componentPattern;
  }
  add(entity: Entity): void {
    this.list.push(entity);
    this.added.emit({ entity });
  }
  remove(entity: Entity): void {
    // TODO This is horribly inefficient...
    this.list = this.list.filter(v => v.id !== entity.id);
    this.removed.emit({ entity });
  }
}

export default class QuerySystem {
  engine: Engine;
  queries: Query[] = [];
  componentQueriesExclusive: Query[][] = [];
  componentQueriesInclusive: Query[][] = [];
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.getSignal('entity', 'componentAdd')
      .addImmediate(this.handleComponentAdd);
    this.engine.getSignal('entity', 'componentRemove')
      .addImmediate(this.handleComponentRemove);
    this.engine.getSignal('entity', 'entityRemove')
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
        query.add(entity);
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
        query.remove(entity);
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
        query.remove(entity);
      }
    });
  };
}
