class CPU {
  constructor(memory, display, keyboard, timer) {
    this.memory = memory;
    this.display = display;
    this.keyboard = keyboard;
    this.timer = timer;
    this.opcodeExecutor = new OpcodeExecutor(this);

    this.reset();
  }

  reset() {
    // 寄存器 - 16 个通用寄存器 (V0-VF)
    this.V = new Uint8Array(NUM_REGISTERS);

    // 索引寄存器 (I)
    this.I = 0;

    // 程序计数器 (PC)
    this.pc = PROGRAM_START_ADDRESS;

    // 子程序栈 - 16 级
    this.stack = new Uint16Array(STACK_SIZE);
    this.sp = 0; // 栈指针

    // 调试信息
    this.lastOpcode = 0;
    this.lastInstruction = "";

    // 状态
    this.paused = true;
  }

  cycle() {
    if (this.paused || this.keyboard.waitingForKey) {
      return;
    }

    // 获取操作码（2字节）
    const opcode =
      (this.memory.read(this.pc) << 8) | this.memory.read(this.pc + 1);
    this.lastOpcode = opcode;

    // 先增加程序计数器
    this.pc += 2;

    // 解码并执行操作码
    try {
      this.lastInstruction = this.opcodeExecutor.execute(opcode);
    } catch (error) {
      console.error("Error executing opcode:", error);
      reportError(error);
      this.paused = true;
    }
  }

  // 栈操作
  pushStack(value) {
    this.stack[this.sp] = value;
    this.sp++;
  }

  popStack() {
    this.sp--;
    return this.stack[this.sp];
  }

  returnFromSubroutine() {
    this.pc = this.popStack();
  }

  // 其他 CPU 操作...
}
