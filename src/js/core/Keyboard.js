class Keyboard {
  constructor() {
    this.reset();
    this.waitCallback = null;
  }

  reset() {
    // 键盘 - 16 个按键 (0-F)
    this.keys = new Array(NUM_KEYS).fill(0);
    this.waitingForKey = false;
  }

  isKeyPressed(keyCode) {
    return this.keys[keyCode] === 1;
  }

  setKeyState(keyCode, pressed) {
    if (keyCode >= 0 && keyCode < NUM_KEYS) {
      this.keys[keyCode] = pressed ? 1 : 0;

      // 如果正在等待按键并且有按键被按下
      if (this.waitingForKey && pressed && this.waitCallback) {
        this.waitCallback(keyCode);
        this.waitingForKey = false;
        this.waitCallback = null;
      }
    }
  }

  waitForKeyPress(callback) {
    this.waitingForKey = true;
    this.waitCallback = callback;
  }
}
