export default class IdStore extends Set<number> {
  maxId: number = 0;
  constructor() {
    super();
    this.maxId = 0;
  }

  create(): number {
    let newId = this.maxId;
    this.maxId += 1;
    this.add(newId);
    return newId;
  }
}

