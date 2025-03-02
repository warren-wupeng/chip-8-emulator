class Memory {
  constructor() {
    // 初始化 4KB (4096 bytes) 内存
    this.memory = new Uint8Array(MEMORY_SIZE);
    this.loadFontset();
  }

  loadFontset() {
    // 将字体集加载到内存
    for (let i = 0; i < FONTSET_SIZE; i++) {
      this.memory[FONTSET_START_ADDRESS + i] = FONTSET[i];
    }
  }

  read(address) {
    if (address >= 0 && address < MEMORY_SIZE) {
      return this.memory[address];
    }
    throw new Error(`Memory access out of bounds: ${address}`);
  }

  write(address, value) {
    if (address >= 0 && address < MEMORY_SIZE) {
      this.memory[address] = value;
    } else {
      throw new Error(`Memory write out of bounds: ${address}`);
    }
  }

  // 加载 ROM 到内存中的 0x200 (512) 处
  loadROM(romBuffer) {
    for (let i = 0; i < romBuffer.length; i++) {
      if (PROGRAM_START_ADDRESS + i < MEMORY_SIZE) {
        this.memory[PROGRAM_START_ADDRESS + i] = romBuffer[i];
      } else {
        console.warn("ROM too large for memory");
        break;
      }
    }
    return romBuffer.length;
  }

  reset() {
    this.memory.fill(0);
    this.loadFontset();
  }
}
