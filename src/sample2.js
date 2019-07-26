const Engine = require('./engine').default;

const engine = new Engine();
// engine.getSignal('global', 'update');
// engine.getSignal('entity', 'entityCreate');
// engine.getSignal('entity', 'entityRemove');
// engine.getSignal('event', 'death');

engine.addSystem('position', () => {
  engine.getSignal('global', 'init').add(() => {
    const positions = engine.getComponentState('position');
    const query = engine.systems.query.getQuery(['position']);
    query.added.add(entities => {
      entities.forEach(entity => {
        const position = positions[entity.id];
        position.x = 0;
        position.y = 0;
      });
    });
  });
});

engine.addSystem('velocity', () => {
  engine.getSignal('global', 'init').add(() => {
    const query = engine.systems.query.getQuery(['position', 'velocity']);
    const positions = engine.getComponentState('position');
    const positionUpdateSignal = engine.getSignal('entity', 'positionUpdate');
    engine.getSignal('global', 'update').add(() => {
      query.list.forEach(entity => {
        const position = positions[entity.id];
        const velocity = entity.get('velocity'); // This is possible too
        position.x += velocity.x;
        position.y += velocity.y;
        positionUpdateSignal.emit(entity);
      });
    });
    engine.getSignal('entity', 'velocityUpdate').add(events => {
      events.forEach(event => {
        const position = positions[event.entity.id];
        const velocity = event.entity.get('velocity');
        if (velocity.x > 1000) {
          position.x = 0;
          positionUpdateSignal.emit(event.entity);
        }
      });
    });
  });
});

engine.addComponent('position', v => v);
engine.addComponent('velocity', v => v);

engine.init();

let entity = engine.createEntity();
entity.set('position', { x: 0, y: 1 });
entity.set('velocity', { x: 0, y: 1 });

// Or...
entity = engine.createEntity();
const positions = engine.getComponentState('position');
positions[entity.id] = { x: 0, y: 0 };
engine.getSignal('entity', 'componentAdd')
  .emit({ entity, componentId: engine.components.indexOf('position') });

engine.update();

console.log(engine.state);
console.log(engine.systems.query.queries);
