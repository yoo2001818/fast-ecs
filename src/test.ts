import Engine from './engine';
import IdStore from './idStore';
import ComponentStore from './componentStore';
import EntityHelper from './entityHelper';

const engine = new Engine();
engine.addStore('id', new IdStore());
engine.addStore('position', new ComponentStore('position'));
engine.addHelper('entity', new EntityHelper());


const entityId = engine.getHelper<EntityHelper>('entity').createEntity({
  position: { x: 3, y: 3 },
});
console.log(engine.getHelper<EntityHelper>('entity').getEntity(entityId));
