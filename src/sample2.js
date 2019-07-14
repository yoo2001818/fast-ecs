import Engine from './index';

const engine = new Engine();
// engine.getSignal('global', 'update');
// engine.getSignal('entity', 'entityCreate');
// engine.getSignal('entity', 'entityRemove');
// engine.getSignal('event', 'death');

engine.addSystem('position', () => {
  const positions = engine.state.getComponent('position');
  const query = engine.systems.query.getQuery(['position']);
  query.added.add(entities => {
    entities.forEach(entity => {
      const position = positions.get(entity);
      position.x = 0;
      position.y = 0;
    });
  });
});
