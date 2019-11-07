import BitSet from './bitSet';

describe('BitSet', () => {
  describe('#set', () => {
    it('should correct set value to 1', () => {
      let set = new BitSet();
      set.set(1, true);
      expect(set.get(1)).toBe(true);
      set.set(1023, true);
      expect(set.get(1023)).toBe(true);
      set.set(65535, true);
      expect(set.get(65535)).toBe(true);
    });
    it('should correct set value to 0', () => {
      let set = new BitSet();
      set.set(1, true);
      set.set(1, false);
      expect(set.get(1)).toBe(false);
      set.set(1023, false);
      expect(set.get(1023)).toBe(false);
      set.set(65535, false);
      expect(set.get(65535)).toBe(false);
    });
  });
  describe('#get', () => {
    
  });
  describe('#setWord', () => {

  });
  describe('#getWord', () => {

  });
  describe('#clear', () => {
    it('should correctly reset the value', () => {
      let set = new BitSet();
      set.set(1, true);
      set.set(2, true);
      set.clear();
      expect(set.get(1)).toBe(false);
    });
  });
  describe('#add', () => {
    it('should correct set value', () => {
      let set = new BitSet();
      set.add(1);
      expect(set.get(1)).toBe(true);
    });
  });
  describe('#delete', () => {
    it('should correct set value', () => {
      let set = new BitSet();
      set.set(1, true);
      set.delete(1);
      expect(set.get(1)).toBe(false);
    });
  });
  describe('#has', () => {
    it('should return correct value', () => {
      let set = new BitSet();
      expect(set.has(1)).toBe(false);
      set.set(1, true);
      expect(set.has(1)).toBe(true);
    });
  });
  describe('#and', () => {
    it('should run AND correctly', () => {
    });
  });
  describe('#andNot', () => {
  });
  describe('#or', () => {
  });
  describe('#xor', () => {
  });
  describe('#forEach', () => {
  });
});
