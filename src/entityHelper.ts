import { EngineHelper } from './type';
import Engine from './engine';
import IdStore from './idStore';
import ComponentStore from './componentStore';

export default class EntityHelper implements EngineHelper {
  engine: Engine;
  register(engine: Engine): void {
    this.engine = engine;
  }
  unregister(): void {
  }
  createEntity(entity: { [key: string]: unknown }): number {
    const idStore = this.engine.getStore<IdStore>('id');
    const newId = idStore.create();
    for (const key in entity) {
      if (Object.hasOwnProperty.call(entity, key)) {
        const store = this.engine.getStore<ComponentStore<unknown>>(key);
        store.set(newId, entity[key]);
      }
    }
    return newId;
  }
}
