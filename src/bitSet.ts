function calcSkipValue(input: number): number {
  let blit = 0;
  // 1. Run sieve first;
  blit =
    ((0x88888888 & input) >>> 3) |
    ((0x44444444 & input) >>> 2) |
    ((0x22222222 & input) >>> 1) |
    (0x11111111 & input);
  // 2. Shift them to the value
  blit =
    ((blit & 0x10000000) >>> 21) |
    ((blit & 0x01000000) >>> 18) |
    ((blit & 0x00100000) >>> 15) |
    ((blit & 0x00010000) >>> 12) |
    ((blit & 0x00001000) >>> 9) |
    ((blit & 0x00000100) >>> 6) |
    ((blit & 0x00000010) >>> 3) |
    (blit & 0x00000001);
  return blit;
}

function blit(input: number, offset: number, value: number): number {
  return (input & ~(0xFF << offset)) | (value << offset);
}

export default class BitSet implements Set<number> {
  size: number;
  cardinality: number;
  length: number;
  pages: Int32Array[] = [];
  // Skip bitset; inspired from https://github.com/amethyst/hibitset
  // Each layer should contain 4 values from previous buffer.
  // Layer 3: --------------------------------------1
  // Layer 2: ------------------1 ------------------0
  // Layer 1: ---0 ---1 ---0 ---0 ---0 ---0 ---0 ---0
  // Layer 0: 0000 0001 0000 0000 0000 0000 0000 0000
  // Layer 0 is stored inside 'pages', and other layers are considered
  // 'indexes'.
  // Layer 0 is 1024 bytes - 1 bit per 1 bit.
  // Layer 1 is 256 bytes - 4 bits per 1 bit.
  // Layer 2 is 64 bytes - 16 bits per 1 bit.
  // Layer 3 is 16 bytes - 64 bits per 1 bit.
  // Layer 1-3 is packed to 42 integers (336 bytes).
  skipPages: Int32Array[] = [];

  _getPage(pageId: number): Int32Array {
    let page = this.pages[pageId];
    if (page == null) {
      page = new Int32Array(256);
      this.pages[pageId] = page;
    }
    return page;
  }
  _getPageIfExists(pageId: number): Int32Array | null {
    const page = this.pages[pageId];
    return page;
  }

  _getSkipPage(pageId: number): Int32Array {
    let page = this.skipPages[pageId];
    if (page == null) {
      page = new Int32Array(84);
      this.skipPages[pageId] = page;
    }
    return page;
  }
  _generateSkipPageWord(pageId: number, wordPos: number, value: number): void {
    // Regenerate skip page for the given word.
    // Each 4 bits are compacted to 1 bit - therefore 32 bits are combined to
    // 8 bits. This sets 1 byte of layer 1.
    // We repeat this for 3 times to generate each layer.
    const skipPage = this._getSkipPage(pageId);
    const skip1Pos = wordPos >>> 2;
    const skip1Offset = (wordPos << 3) % 32;
    const skip2Pos = (skip1Pos >>> 2);
    const skip2Offset = (skip1Pos << 3) % 32;
    const skip3Pos = (skip2Pos >>> 2);
    const skip3Offset = (skip2Pos << 3) % 32;
    const skip1 = blit(skipPage[skip1Pos], skip1Offset, calcSkipValue(value));
    const skip2 = blit(skipPage[skip2Pos + 64], skip2Offset,
      calcSkipValue(skip1));
    const skip3 = blit(skipPage[skip3Pos + 80], skip3Offset,
      calcSkipValue(skip2));
    skipPage[skip1Pos] = skip1;
    skipPage[skip2Pos + 64] = skip2;
    skipPage[skip3Pos + 80] = skip3;
  }
  _generateSkipPage(pageId: number): void {
    // If we're regenerating entire page, we can just calculate each skip page.
    const page = this._getPage(pageId);
    const skipPage = this._getSkipPage(pageId);
    // Mux 4 integers into one...
    for (let i = 0; i < page.length; i += 4) {
      let out = 0;
      for (let j = 0; j < 4; j += 1) {
        out |= calcSkipValue(page[i + j]) << (j * 8);
      }
      skipPage[i >> 2] = out;
    }
    // The same goes for level 1 and 2.
    for (let i = 0; i < 64; i += 4) {
      let out = 0;
      for (let j = 0; j < 4; j += 1) {
        out |= calcSkipValue(skipPage[i + j]) << (j * 8);
      }
      skipPage[(i >> 2) + 64] = out;
    }
    for (let i = 0; i < 16; i += 4) {
      let out = 0;
      for (let j = 0; j < 4; j += 1) {
        out |= calcSkipValue(skipPage[i + j + 64]) << (j * 8);
      }
      skipPage[(i >> 2) + 80] = out;
    }
  }

  clear(): void {
    this.pages = [];
    this.skipPages = [];
  }
  set(key: number, value: boolean): this {
    const pageId = key >> 13;
    const pageWord = (key >> 5) & 0xFF;
    const page = this._getPage(pageId);
    let wordValue = page[pageWord];
    if (value) wordValue |= 1 << (key & 31);
    else wordValue &= ~(1 << (key & 31));
    page[pageWord] = wordValue;
    this._generateSkipPageWord(pageId, pageWord, wordValue);
    return this;
  }
  setWord(wordPos: number, value: number): void {
    const pageId = wordPos / 256 | 0;
    const page = this._getPage(pageId);
    const pos = wordPos % 256;
    page[pos] = value;
    this._generateSkipPageWord(pageId, pos, value);
  }
  add(value: number): this {
    return this.set(value, true);
  }
  delete(value: number): boolean {
    this.set(value, false);
    // TODO Check if bit was true
    return true;
  }
  has(key: number): boolean {
    return this.get(key);
  }
  get(key: number): boolean {
    const pageId = key >> 13;
    const pageByte = key >> 5;
    const pageOffset = pageByte & 255;
    const page = this._getPageIfExists(pageId);
    if (page == null) return false;
    return (page[pageOffset] & (1 << (key & 31))) !== 0;
  }
  getWord(wordPos: number): number {
    const pageId = wordPos / 256 | 0;
    const page = this._getPageIfExists(pageId);
    if (page == null) return 0;
    return page[wordPos % 256];
  }
  [Symbol.iterator](): IterableIterator<number> {
    return this.values();
  }
  forEach(
    callbackfn: (value: number, value2: number, set: Set<number>) => void,
    thisArg?: any,
  ): void {
    for (const value of this.values()) {
      callbackfn.call(thisArg, value, value, this);
    }
  }
  * entries(): IterableIterator<[number, number]> {
    for (const value of this.values()) {
      yield [value, value];
    }
  }
  keys(): IterableIterator<number> {
    return this.values();
  }
  * values(): IterableIterator<number> {
    for (let i = 0; i < this.pages.length; i += 1) {
      const page = this.pages[i];
      if (page == null) continue;
      const skipPage = this.skipPages[i];
      let skipPage1Val = 0;
      let skipPage2Val = 0;
      let skipPage3Val = 0;
      // skip page 1: 0.125 bytes per 1 bit, wraps every 4 byte
      // skip page 2: 0.5 bytes per 1 bit, wraps every 16 byte
      // skip page 3: 2 bytes per 1 bit, wraps every 64 byte
      for (let j = 0; j < page.length; j += 1) {
        if (j % 64 === 0) skipPage3Val = skipPage[(j / 64 | 0) + 80];
        if (j % 16 === 0) skipPage2Val = skipPage[(j / 16 | 0) + 64];
        if (j % 4 === 0) skipPage1Val = skipPage[j / 4 | 0];
        if (j % 2 === 0) {
          if (!(skipPage3Val & (1 << ((j >> 1) % 32)))) {
            j += 1;
            continue;
          }
        }
        let value = page[j];
        let pos = 0;
        while (value !== 0) {
          if (pos % 16 === 0) {
            if (!(skipPage2Val & (1 << ((j >> 2) + (pos >> 4))))) {
              pos += 16;
              value >>>= 16;
              continue;
            }
          }
          if (pos % 4 === 0) {
            if (!(skipPage1Val & (1 << (pos >> 2)))) {
              pos += 4;
              value >>>= 4;
              continue;
            }
          }
          if (value & 1) yield pos + j * 32 + i * 256 * 32;
          pos += 1;
          value >>>= 1;
        }
      }
    }
  }
  [Symbol.toStringTag]: string = 'BitSet';
  and(set: BitSet): BitSet {
    const output = new BitSet();
    const minPages = Math.min(set.pages.length, this.pages.length);
    for (let i = 0; i < minPages; i += 1) {
      const aPage = this.pages[i];
      const bPage = set.pages[i];
      if (aPage == null || bPage == null) {
        continue;
      }
      const outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] & bPage[j];
      }
      output.pages[i] = outPage;
      output._generateSkipPage(i);
    }
    return output;
  }
  // this AND ~set
  andNot(set: BitSet): BitSet {
    const output = new BitSet();
    for (let i = 0; i < this.pages.length; i += 1) {
      const aPage = this.pages[i];
      const bPage = set.pages[i];
      if (aPage == null) continue;
      if (bPage == null) {
        output.pages[i] = aPage;
        continue;
      }
      const outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] & ~bPage[j];
      }
      output.pages[i] = outPage;
      output._generateSkipPage(i);
    }
    return output;
  }
  or(set: BitSet): BitSet {
    const output = new BitSet();
    const maxPages = Math.max(set.pages.length, this.pages.length);
    for (let i = 0; i < maxPages; i += 1) {
      const aPage = this.pages[i];
      const bPage = set.pages[i];
      if (aPage == null) {
        output.pages[i] = bPage;
        continue;
      }
      if (bPage == null) {
        output.pages[i] = aPage;
        continue;
      }
      const outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] | bPage[j];
      }
      output.pages[i] = outPage;
      output._generateSkipPage(i);
    }
    return output;
  }
  xor(set: BitSet): BitSet {
    const output = new BitSet();
    const maxPages = Math.max(set.pages.length, this.pages.length);
    for (let i = 0; i < maxPages; i += 1) {
      const aPage = this.pages[i];
      const bPage = set.pages[i];
      if (aPage == null) {
        output.pages[i] = bPage;
        continue;
      }
      if (bPage == null) {
        output.pages[i] = aPage;
        continue;
      }
      const outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] ^ bPage[j];
      }
      output.pages[i] = outPage;
      output._generateSkipPage(i);
    }
    return output;
  }
}
