class Timer {
  constructor() {
    this.reset();
  }

  reset() {
    this.delay = 0;
    this.sound = 0;
    this.soundFlag = false;
  }

  update() {
    if (this.delay > 0) {
      this.delay--;
    }

    if (this.sound > 0) {
      this.soundFlag = true;
      this.sound--;
    } else {
      this.soundFlag = false;
    }
  }

  setDelay(value) {
    this.delay = value;
  }

  getDelay() {
    return this.delay;
  }

  setSound(value) {
    this.sound = value;
  }

  isSoundActive() {
    return this.soundFlag;
  }
}
