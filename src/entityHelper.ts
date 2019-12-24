import { EngineHelper } from './type';
import Engine from './engine';
import IdStore from './idStore';

export default class EntityHelper implements EngineHelper {
  engine: Engine;
  register(engine: Engine): void {
    this.engine = engine;
  }
  unregister(): void {
  }
  createEntity(entity: { [key: string]: unknown }): number {
    const idStore = this.engine.getComponentStore<IdStore>('id');
    const newId = idStore.create();
    for (const key in entity) {
      if (Object.hasOwnProperty.call(entity, key)) {
        const store = this.engine.getComponentStore(key);
        store.set(newId, entity[key]);
      }
    }
    return newId;
  }
  getEntity(id: number): { [key: string]: unknown } {
    const result: { [key: string]: unknown } = {};
    result.id = id;
    for (const key of this.engine.componentStoreNames) {
      const store = this.engine.getComponentStore(key);
      const value = store.get(id);
      if (value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }
  deleteEntity(id: number): void {
    for (const key of this.engine.componentStoreNames) {
      const store = this.engine.getComponentStore(key);
      store.delete(id);
    }
  }
}
