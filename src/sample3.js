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
    const position = engine.getComponent('position');
    const query = engine.systems.query.getQuery(['position']);
    return {
      init() {
      },
      update() {
        query.added.forEach(entity => {
          position.set(entity, { x: 0, y: 0 });
        });
      },
    };
  })
  .addSystem('velocity', engine => {
    const position = engine.getComponent('position');
    const query = engine.systems.query.getQuery(['position', 'velocity']);
  });
