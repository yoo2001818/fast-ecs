function calcSkipValue(
  offset: number,
  input: number,
  prevSkipValue: number,
): number {
  const blitMask = 0xFF;
  let blit = 0;
  // 1. Run sieve first;
  blit =
    ((0x88888888 & input) >>> 3) |
    ((0x44444444 & input) >>> 2) |
    ((0x22222222 & input) >>> 1) |
    (0x11111111 & input);
  // 2. Shift them to the value
  blit =
    (blit & 0x10000000 >>> 21) |
    (blit & 0x01000000 >>> 18) |
    (blit & 0x00100000 >>> 15) |
    (blit & 0x00010000 >>> 12) |
    (blit & 0x00001000 >>> 9) |
    (blit & 0x00000100 >>> 6) |
    (blit & 0x00000010 >>> 3) |
    (blit & 0x00000001);
  return (prevSkipValue & ~(blitMask << offset)) | (blit << offset);
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
    if (page == null) this.pages[pageId] = page = new Int32Array(256);
    return page;
  }
  _getPageIfExists(pageId: number): Int32Array | null {
    let page = this.pages[pageId];
    return page;
  }

  _getSkipPage(pageId: number): Int32Array {
    let page = this.skipPages[pageId];
    if (page == null) {
      this.skipPages[pageId] = page = new Int32Array(84);
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
    const skip1 = calcSkipValue(skip1Offset, value, skipPage[skip1Pos]);
    const skip2 = calcSkipValue(skip2Offset, skip1, skipPage[skip2Pos + 64]);
    const skip3 = calcSkipValue(skip3Offset, skip2, skipPage[skip3Pos + 80]);
    skipPage[skip1Pos] = skip1;
    skipPage[skip2Pos + 64] = skip2;
    skipPage[skip3Pos + 80] = skip3;
  }
  _generateSkipPage(pageId: number): void {
    // If we're regenerating entire page, we can just calculate each skip page.
    const page = this._getPage(pageId);
    const skipPage = this._getSkipPage(pageId);
    // Mux 4 pages into one...
    for (let i = 0; i < page.length; i += 4) {
      let out = 0;
      for (let j = 0; j < 4; j += 1) {
        out |= calcSkipValue(j * 8, page[i + j], 0);
      }
      skipPage[i] = out;
    }
  }

  clear(): void {
    this.pages = [];
    this.skipPages = [];
  }
  set(key: number, value: boolean): this {
    const pageId = key >> 13;
    const pageByte = key >> 5;
    const pageOffset = pageByte & 255;
    const page = this._getPage(pageId);
    if (value) page[pageOffset] |= 1 << (key & 31);
    else page[pageOffset] &= ~(1 << (key & 31));
    if (value) {
      for (let i = 0; i < 3; i += 1) {
        const skipPage = this._getSkipPage(i, pageId);
        const skipKey = (key & 8191) >> ((i + 1) * 2);
        const skipOffset = skipKey >> 5;
        const skipPos = skipKey & 31;
        skipPage[skipOffset] |= 1 << skipPos;
      }
    }
    return this;
  }
  setWord(wordPos: number, value: number): void {
    const pageId = wordPos / 256 | 0;
    const page = this._getPage(pageId);
    page[wordPos % 256] = value;
    // Rebuild skip page
    // Layer 1 and 2 should be set to match provided word. This should be done
    // by using bit bliting - AND with mask and OR with given value.
    {
      const skipPage = this._getSkipPage(0, pageId);
      let blit = 0;
      let valueTmp = value;
      while (valueTmp) {
        blit <<= 1;
        if (valueTmp & LAYER1_SIEVE) blit |= 1;
        valueTmp >>>= 4;
      }
      const skipPos = wordPos >> 2;
      const skipOffset = (wordPos % 4) * 8;
      let blitClear = ~(0xFF << skipOffset);
      skipPage[skipPos] = skipPage[skipPos] & blitClear | (blit << skipOffset);
    }
    {
      const skipPage = this._getSkipPage(1, pageId);
      let blit = 0;
      let valueTmp = value;
      while (valueTmp) {
        blit <<= 1;
        if (valueTmp & LAYER2_SIEVE) blit |= 1;
        valueTmp >>>= 16;
      }
      const skipPos = wordPos >> 4;
      const skipOffset = (wordPos % 16) * 2;
      let blitClear = ~(0x3 << skipOffset);
      skipPage[skipPos] = skipPage[skipPos] & blitClear | (blit << skipOffset);
    }
    // Layer 3 should be set if only one bit it set; it is shared between
    // two words.
    if (value) {
      const skipPage = this._getSkipPage(2, pageId);
      const skipPos = wordPos >> 6;
      const skipOffset = (wordPos / 2 | 0) % 32;
      skipPage[skipPos] |= (1 << skipOffset);
    }
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
    for (let value of this.values()) {
      callbackfn.call(thisArg, value, value, this);
    }
  }
  *entries(): IterableIterator<[number, number]> {
    for (let value of this.values()) {
      yield [value, value];
    }
  }
  keys(): IterableIterator<number> {
    return this.values();
  }
  *values(slow: boolean = false): IterableIterator<number> {
    for (let i = 0; i < this.pages.length; i += 1) {
      const page = this.pages[i];
      if (page == null) continue;
      const skipPage1 = this.skipPages[0][i];
      const skipPage2 = this.skipPages[1][i];
      const skipPage3 = this.skipPages[2][i];
      let skipPage1Val;
      let skipPage2Val;
      let skipPage3Val;
      // skip page 1: 0.125 bytes per 1 bit, wraps every 4 byte
      // skip page 2: 0.5 bytes per 1 bit, wraps every 16 byte
      // skip page 3: 2 bytes per 1 bit, wraps every 64 byte
      for (let j = 0; j < page.length; j += 1) {
        if (!slow) {
          if (j % 64 === 0) skipPage3Val = skipPage3[j / 64 | 0];
          if (j % 16 === 0) skipPage2Val = skipPage2[j / 16 | 0];
          if (j % 4 === 0) skipPage1Val = skipPage1[j / 4 | 0];
          if (j % 2 === 0) {
            if (!(skipPage3Val & 1)) {
              j += 1;
              skipPage1Val >>>= 16;
              skipPage2Val >>>= 4;
              skipPage3Val >>>= 1;
              continue;
            }
            skipPage3Val >>>= 1;
          }
        }
        let value = page[j];
        let pos = 0;
        while (value !== 0) {
          if (!slow) {
            if (pos % 16 === 0) {
              if (!(skipPage2Val & 1)) {
                skipPage1Val >>>= 4;
                skipPage2Val >>>= 1;
                pos += 16;
                value >>>= 16;
                continue;
              }
              skipPage2Val >>>= 1;
            }
            if (pos % 4 === 0) {
              if (!(skipPage1Val & 1)) {
                skipPage1Val >>>= 1;
                pos += 4;
                value >>>= 4;
                continue;
              }
              skipPage1Val >>>= 1;
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
    let output = new BitSet();
    const minPages = Math.min(set.pages.length, this.pages.length);
    for (let i = 0; i < minPages; i += 1) {
      let aPage = this.pages[i];
      let bPage = set.pages[i];
      if (aPage == null || bPage == null) {
        continue;
      }
      let outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] & bPage[j];
      }
      output.pages[i] = outPage;
    }
    output._generateSkipPage();
    return output;
  }
  // this AND ~set
  andNot(set: BitSet): BitSet {
    let output = new BitSet();
    for (let i = 0; i < this.pages.length; i += 1) {
      let aPage = this.pages[i];
      let bPage = set.pages[i];
      if (aPage == null) continue;
      if (bPage == null) {
        output.pages[i] = aPage;
        continue;
      }
      let outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] & ~bPage[j];
      }
      output.pages[i] = outPage;
    }
    output._generateSkipPage();
    return output;
  }
  or(set: BitSet): BitSet {
    let output = new BitSet();
    const maxPages = Math.max(set.pages.length, this.pages.length);
    for (let i = 0; i < maxPages; i += 1) {
      let aPage = this.pages[i];
      let bPage = set.pages[i];
      if (aPage == null) {
        output.pages[i] = bPage;
        continue;
      }
      if (bPage == null) {
        output.pages[i] = aPage;
        continue;
      }
      let outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] | bPage[j];
      }
      output.pages[i] = outPage;
    }
    output._generateSkipPage();
    return output;
  }
  xor(set: BitSet): BitSet {
    let output = new BitSet();
    const maxPages = Math.max(set.pages.length, this.pages.length);
    for (let i = 0; i < maxPages; i += 1) {
      let aPage = this.pages[i];
      let bPage = set.pages[i];
      if (aPage == null) {
        output.pages[i] = bPage;
        continue;
      }
      if (bPage == null) {
        output.pages[i] = aPage;
        continue;
      }
      let outPage = new Int32Array(256);
      for (let j = 0; j < outPage.length; j += 1) {
        outPage[j] = aPage[j] ^ bPage[j];
      }
      output.pages[i] = outPage;
    }
    output._generateSkipPage();
    return output;
  }
}
