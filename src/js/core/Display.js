class Display {
  constructor() {
    this.reset();
  }

  reset() {
    // 显示缓冲区 - 64x32 像素
    this.buffer = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT).fill(0);
    this.drawFlag = false;
  }

  setPixel(x, y, value) {
    const pixelPos = (y % DISPLAY_HEIGHT) * DISPLAY_WIDTH + (x % DISPLAY_WIDTH);

    // XOR 像素
    const oldValue = this.buffer[pixelPos];
    this.buffer[pixelPos] ^= value;

    // 返回是否发生碰撞
    return oldValue === 1 && this.buffer[pixelPos] === 0;
  }

  clear() {
    this.buffer.fill(0);
    this.drawFlag = true;
  }

  getBuffer() {
    return this.buffer;
  }
}
