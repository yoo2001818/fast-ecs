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
      for (let i = 0; i < 1000; i += 1) {
        set.set(i * 100000, true);
      }
    });
    it('should correct set value to 0', () => {
      let set = new BitSet();
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
  describe('#clear', () => {
    
  });
  describe('#add', () => {
    
  });
  describe('#delete', () => {
    
  });
  describe('#has', () => {
    
  });
});
