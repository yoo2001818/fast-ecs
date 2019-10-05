// Game tick is separated to two phases, update phase and apply phase.
// Update phase actually updates the game state, and apply phase propagates
// the updated game state.
//
// To do this, the update phase must set the bit flag to trigger the updates.
// (Or it can use array, sorted set, etc)
// Apply phase compare the previous state and current state to re-index the
// data, or just rewrite the index completely.
// Systems in update phase can use signals?

const storage = {};
const componentIndex = {};
const updateSystems = [];
const applySystems = [];
const update = () => {
  updateSystems.forEach(v => v());
  applySystems.forEach(v => v());
};

storage.position = new ComponentStore();
componentIndex.position = new ComponentIndex();

updateSystems.push(() => {
  componentIndex.position.forEach(id => {
    storage.position.get(id).x += 1;
    storage.position.get(id).y += 1;
    storage.position.setUpdated(id);
  });
});

applySystems.push(() => {
  componentIndex.position.changed.forEach(id => {
    // Update quad tree
  });
});
