const storage = {};
const indexes = {};
const signals = {};
const systems = [];
const update = () => {
  systems.forEach(v => v());
};

function addSystem(name, callback) {
  // Insert system in appropriate position
  systems.push(callback);
}

storage.id = new IdStore();
storage.position = new ComponentStore();
indexes.position = new ComponentIndex();
indexes.positionChanged = new ComponentIndex();
indexes.quadtree = new QuadTree();

addSystem('reset', () => {
  indexes.positionChanged.reset();
});

addSystem('move', () => {
  indexes.position.forEach(id => {
    storage.position.get(id).x += 1;
    storage.position.get(id).y += 1;
    signals.emit(['componentChanged', 'position'], id);
  });
});

addSystem('spawn', () => {
  const id = storage.id.create();
  storage.position.set(id, { x: 0, y: 0 });
  signals.emit(['entityCreated'], id);
  signals.emit(['componentAdded', 'position'], id);
});

addSystem('death', () => {
  indexes.quadtree.find(-Infinity, 1000, Infinity, Infinity).forEach(id => {
    storage.id.delete(id);
    // TODO Optimize this; This would be O(n) where n is number of components.
    storage.position.delete(id);
    signals.emit(['componentDeleted', 'position'], id);
    signals.emit(['entityDeleted'], id);
  });
});

addSystem('quadtree', () => {
  indexes.positionChanged.forEach((id) => {
    // Update
    indexes.quadtree.update(id, storage.position.get(id));
  });
});

update();
