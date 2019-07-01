import Engine from './index';

const engine = new Engine();
engine.addGlobalSignal('update', () => {});
// If pool is used
engine.addEntitySignalWithPool('velocityUpdate', class VelocityUpdate {
  constructor() {
    this.entity = null;
    this.xChanged = false;
    this.yChanged = false;
  }

  init(entity, xChanged, yChanged) {
    this.entity = entity;
    this.xChanged = xChanged;
    this.yChanged = yChanged;
  }

  merge(entity, xChanged, yChanged) {
    this.xChanged = xChanged || this.xChanged;
    this.yChanged = yChanged || this.yChanged;
  }
});
// If pool is not used
engine.addEntitySignal('velocityUpdate',
  (entity, xChanged, yChanged) => ({ entity, xChanged, yChanged }),
  (prev, entity, xChanged, yChanged) => ({
    entity,
    xChanged: prev.xChanged || xChanged,
    yChanged: prev.yChanged || yChanged,
  }));
engine.addSystem('position', () => {
  // engine.systems.query.get()
  const positions = engine.state.getComponent('position');
  const query = engine.getQuery(['position']);
  query.addEventListener('add', entities => {
    entities.forEach(entity => {
      const position = positions.get(entity);
      position.x = 0;
      position.y = 0;
    });
  });
});
engine.addSystem('velocity', () => {
  const query = engine.getQuery(['position']);
  const positions = engine.state.getComponent('position');
  // const velocitys = engine.state.getComponent('velocity');
  // There are 4 kinds of event -
  // - global event: doesn't use any event queue
  // - entity event: triggered only once per entity. This will be merged and
  //   if too many events occurs, it'll adaptively use different methods to
  //   create events, such as changed flag
  //   merging logic can be specified when attaching event
  // - entity-specific event: triggered to only one entity..
  // - normal event: uses event queue where possible
  engine.addEventListener('update', () => {
    query.list.forEach(entity => {
      const position = positions.get(entity);
      const velocity = entity.get('velocity'); // This is possible too
      position.x += velocity.x;
      position.y += velocity.y;
    });
  });
  engine.addEventListener('velocityUpdate', events => {
    events.forEach(event => {
      const position = positions.get(event.entity);
      const velocity = event.entity.get('velocity');
      if (velocity.x > 1000) {
        position.x = 0;
      }
    });
  });
});
// This utilizes object pooling
engine.addComponentWithPool('position', class Position {
  constructor(e) {
    this.engine = e;
    this.x = 0;
    this.y = 0;
  }

  init(x, y) {
    this.x = x;
    this.y = y;
  }

  dispose() {
  }
});
// While this does not (Should this be supported anyway?)
engine.addComponent('velocity', (x, y) => ({ x, y }));

engine.addEntity()
  .addComponent('position', 0, 0);

// Or...
const entity = engine.addEntity();
const positions = engine.state.getComponent('position');
positions.add(entity, 0, 0);
