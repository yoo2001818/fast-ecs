import Engine from './engine';
import ComponentStore from './componentStore';

const engine = new Engine();
// Add components...
engine
  .addComponent('position', new ComponentStore())
  .addComponent('velocity', new ComponentStore())
  .addComponent('player', new ComponentStore());
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
    return {
      init() {
        velocities.changed.addListener(entities => {
          entities.forEach(entity => {
            const position = positions.get(entity);
            const velocity = velocities.get(entity);
            if (velocity.x > 1000) {
              position.x = 0;
              positions.setChanged(entity);
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
          positions.setChanged(entity);
        });
      },
    };
  })
  .addSystem('die', engine => {
    const dieSignal = engine.getEntitySignal('die');
    const positions = engine.getComponent('position');
    return {
      init() {
        positions.changed.addListener(entities => {
          entities.forEach(entity => {
            const position = positions.get(entity);
            if (Math.abs(position.x) > 1000 || Math.abs(position.y) > 1000) {
              dieSignal.emit({ entity, reason: 'outOfBounds' });
              engine.removeEntity(entity);
            }
          });
        });
      },
    };
  })
  .addSystem('gameover', engine => {
    const dieSignal = engine.getEntitySignal('die');
    const players = engine.getComponent('player');
    return {
      init() {
        dieSignal.addListener(entities => {
          entities.forEach(entity => {
            if (players.has(entity)) {
              engine.createEntity({
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                player: true,
              });
            }
          });
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
  engine.createEntity({
    position: { x: 0, y: 0 },
  });
});
engine.update();
