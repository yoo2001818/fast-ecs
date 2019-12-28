import Engine from './engine';
import IdStore from './idStore';
import ComponentStore from './rbComponentStore';
import ComponentIndex from './componentIndex';
import EntityHelper from './entityHelper';

const engine = new Engine();
engine.addComponentStore('id', new IdStore());
engine.addComponentStore('position', new ComponentStore('position'));
engine.addComponentStore('velocity', new ComponentStore('velocity'));
engine.addIndex('position', new ComponentIndex('position'));
engine.addHelper('entity', new EntityHelper());

const entityId = engine.getHelper<EntityHelper>('entity').createEntity({
  position: { x: 3, y: 3 },
});
console.log(engine.getHelper<EntityHelper>('entity').getEntity(entityId));
console.log(engine.getIndex<ComponentIndex>('position'));

engine.addSystem('move', {
  register(engine) {
    const positionIndex = engine.getIndex<ComponentIndex>('position');
    const positionStore = engine.getComponentStore('position');
    engine.getSignal('update').addListener(null, () => {
      positionIndex.forEach((id) => {
        const pos = positionStore.get(id) as any;
        positionStore.set(id, { x: pos.x + 1, y: pos.y + 1 });
      });
    });
  },
  unregister() {

  },
});

engine.update();
engine.update();
engine.update();
engine.update();

console.log(engine.getHelper<EntityHelper>('entity').getEntity(entityId));
