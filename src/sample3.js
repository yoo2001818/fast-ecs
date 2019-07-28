import Engine from './engine';
import ComponentStore from './componentStore';

const engine = new Engine();
// Add components...
engine
  .addComponent('position', new ComponentStore())
  .addComponent('velocity', new ComponentStore());
// Add systems...
engine
  .addSystem('position', engine => {
    const positions = engine.getComponent('position');
    const query = engine.getQuery(['position']);
    query.added.addListener(entities => {
      entities.forEach(entity => {
        positions.set(entity, { x: 0, y: 0 });
      });
    });
    return {};
  })
  .addSystem('velocity', engine => {
    const positions = engine.getComponent('position');
    const velocities = engine.getComponent('velocity');
    const query = engine.getQuery(['position', 'velocity']);
    const positionUpdateSignal = engine.getEntitySignal('positionUpdate');
    const velocityUpdateSignal = engine.getEntitySignal('velocityUpdate');
    return {
      init() {
        velocityUpdateSignal.addListener(events => {
          events.forEach(event => {
            const { entity } = event;
            const position = positions.get(entity);
            const velocity = velocities.get(entity);
            if (velocity.x > 1000) {
              position.x = 0;
              positionUpdateSignal.emit({ entity });
            }
          });
        });
      },
      update() {
        query.forEach(entity => {
          const position = positions.get(entity);
          const velocity = velocities.get(entity);
          position.x += velocity.x;
          position.y += velocity.y;
          positionUpdateSignal.emit({ entity });
        });
      },
    };
  });

engine.init();
engine.run(() => {
  const entity = engine.createEntity({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 1 },
  });
  engine.getComponent('position').set(entity, { x: 0, y: 0 });
});
engine.update();
