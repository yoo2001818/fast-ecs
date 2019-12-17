import { EngineHelper } from './type';
import Engine from './engine';

export default class EntityHelper implements EngineHelper {
  engine: Engine;
  register(engine: Engine): void {
    this.engine = engine;
  }
  unregister(): void {
    this.engine = null;
  }
  createEntity(entity: unknown): number {
    return null;
  }
}
