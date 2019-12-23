import Engine from './engine';
import IdStore from './idStore';
import ComponentStore from './componentStore';
import ComponentIndex from './componentIndex';
import EntityHelper from './entityHelper';

const engine = new Engine();
engine.addStore('id', new IdStore());
engine.addStore('position', new ComponentStore('position'));
engine.addStore('velocity', new ComponentStore('velocity'));
engine.addIndex('position', new ComponentIndex('position'));
engine.addHelper('entity', new EntityHelper());


const entityId = engine.getHelper<EntityHelper>('entity').createEntity({
  position: { x: 3, y: 3 },
});
console.log(engine.getHelper<EntityHelper>('entity').getEntity(entityId));
console.log(engine.getIndex<ComponentIndex>('position'));
