class Chip8 {
  constructor() {
    try {
      this.memory = new Memory();
      this.display = new Display();
      this.keyboard = new Keyboard();
      this.timer = new Timer();
      this.cpu = new CPU(this.memory, this.display, this.keyboard, this.timer);

      // CPU 速度控制
      this.speed = DEFAULT_CPU_SPEED;
      this.lastCycleTime = 0;
    } catch (error) {
      console.error("Error initializing CHIP-8:", error);
      reportError(error);
    }
  }

  reset() {
    try {
      this.memory.reset();
      this.display.reset();
      this.keyboard.reset();
      this.timer.reset();
      this.cpu.reset();
    } catch (error) {
      console.error("Error resetting CHIP-8:", error);
      reportError(error);
    }
  }

  loadROM(romBuffer) {
    try {
      this.reset();
      const romSize = this.memory.loadROM(romBuffer);
      console.log(`Loaded ROM: ${romSize} bytes`);
      this.cpu.paused = false;
    } catch (error) {
      console.error("Error loading ROM:", error);
      reportError(error);
    }
  }

  cycle() {
    this.cpu.cycle();
  }

  updateTimers() {
    this.timer.update();
  }

  setKeyState(key, pressed) {
    this.keyboard.setKeyState(key, pressed);
  }

  // 暴露必要的接口...
}
