class OpcodeExecutor {
  constructor(cpu) {
    this.cpu = cpu;
  }

  execute(opcode) {
    // 解析操作码组件
    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;
    const n = opcode & 0x000f;
    const nn = opcode & 0x00ff;
    const nnn = opcode & 0x0fff;

    // 根据首位决定主要操作组
    switch (opcode & 0xf000) {
      case 0x0000:
        return this.execute0Commands(opcode);
      case 0x1000:
        return this.executeJump(nnn);
      case 0x2000:
        return this.executeCall(nnn);
      case 0x3000:
        return this.execute3Commands(x, nn);
      case 0x4000:
        return this.execute4Commands(x, nn);
      case 0x5000:
        return this.execute5Commands(x, y);
      case 0x6000:
        return this.execute6Commands(x, nn);
      case 0x7000:
        return this.execute7Commands(x, nn);
      case 0x8000:
        return this.execute8Commands(x, y, n);
      case 0x9000:
        return this.execute9Commands(x, y);
      case 0xa000:
        return this.executeACommands(nnn);
      case 0xb000:
        return this.executeBCommands(nnn);
      case 0xc000:
        return this.executeCCommands(x, nn);
      case 0xd000:
        return this.executeDCommands(x, y, n);
      case 0xe000:
        return this.executeECommands(x, nn);

      case 0xf000:
        return this.executeFCommands(x, nn);
    }

    return "UNKNOWN";
  }

  // 每组操作码的处理方法
  execute0Commands(opcode) {
    switch (opcode) {
      case 0x00e0:
        this.cpu.display.clear();
        return "CLS";
      case 0x00ee:
        this.cpu.returnFromSubroutine();
        return "RET";
      default:
        return "UNKNOWN";
    }
  }

  executeJump(address) {
    this.cpu.pc = address;
    return `JP ${address.toString(16)}`;
  }

  executeCall(address) {
    this.cpu.pushStack(this.cpu.pc);
    this.cpu.pc = address;
    return `CALL ${address.toString(16)}`;
  }

  execute3Commands(x, value) {
    if (this.cpu.V[x] === value) {
      this.cpu.pc += 2;
    }
    return `SE V${x.toString(16)}, ${value.toString(16)}`;
  }

  execute4Commands(x, value) {
    if (this.cpu.V[x] !== value) {
      this.cpu.pc += 2;
    }
    return `SNE V${x.toString(16)}, ${value.toString(16)}`;
  }

  execute5Commands(x, y) {
    if (this.cpu.V[x] === this.cpu.V[y]) {
      this.cpu.pc += 2;
    }
    return `SE V${x.toString(16)}, V${y.toString(16)}`;
  }

  execute6Commands(x, value) {
    this.cpu.V[x] = value;
    return `LD V${x.toString(16)}, ${value.toString(16)}`;
  }

  execute7Commands(x, value) {
    this.cpu.V[x] += value;
    return `ADD V${x.toString(16)}, ${value.toString(16)}`;
  }

  execute8Commandes(x, y, n) {
    switch (n) {
      case 0x0:
        this.cpu.V[x] = this.cpu.V[y];
        return `LD V${x.toString(16)}, V${y.toString(16)}`;
      case 0x1:
        this.cpu.V[x] |= this.cpu.V[y];
        return `OR V${x.toString(16)}, V${y.toString(16)}`;
      case 0x2:
        this.cpu.V[x] &= this.cpu.V[y];
        return `AND V${x.toString(16)}, V${y.toString(16)}`;
      case 0x3:
        this.cpu.V[x] ^= this.cpu.V[y];
        return `XOR V${x.toString(16)}, V${y.toString(16)}`;
      case 0x4:
        this.cpu.V[x] += this.cpu.V[y];
        this.cpu.V[0xf] = this.cpu.V[x] > 0xff ? 1 : 0;
        return `ADD V${x.toString(16)}, V${y.toString(16)}`;
      case 0x5:
        this.cpu.V[0xf] = this.cpu.V[x] > this.cpu.V[y] ? 1 : 0;
        this.cpu.V[x] -= this.cpu.V[y];
        return `SUB V${x.toString(16)}, V${y.toString(16)}`;
      case 0x6:
        this.cpu.V[0xf] = this.cpu.V[x] & 0x1;
        this.cpu.V[x] >>= 1;
        return `SHR V${x.toString(16)}`;
      case 0x7:
        this.cpu.V[0xf] = this.cpu.V[y] > this.cpu.V[x] ? 1 : 0;
        this.cpu.V[x] = this.cpu.V[y] - this.cpu.V[x];
        return `SUBN V${x.toString(16)}, V${y.toString(16)}`;
      case 0xe:
        this.cpu.V[0xf] = this.cpu.V[x] >> 7;
        this.cpu.V[x] <<= 1;
        return `SHL V${x.toString(16)}`;
    }
  }

  execute9Commands(x, y) {
    if (this.cpu.V[x] !== this.cpu.V[y]) {
      this.cpu.pc += 2;
    }
    return `SNE V${x.toString(16)}, V${y.toString(16)}`;
  }

  executeACommands(address) {
    this.cpu.I = address;
    return `LD I, ${address.toString(16)}`;
  }

  executeBCommands(address) {
    this.cpu.pc = this.cpu.V[0] + address;
    return `JP V0, ${address.toString(16)}`;
  }

  executeCCommands(x, value) {
    this.cpu.V[x] = Math.floor(Math.random() * 256) & value;
    return `RND V${x.toString(16)}, ${value.toString(16)}`;
  }

  executeDCommands(x, y, n) {
    const collision = this.cpu.display.drawSprite(
      this.cpu.V[x],
      this.cpu.V[y],
      this.cpu.memory.readBytes(this.cpu.I, n)
    );
    this.cpu.V[0xf] = collision ? 1 : 0;
    return `DRW V${x.toString(16)}, V${y.toString(16)}, ${n.toString(16)}`;
  }

  executeECommands(x, nn) {
    switch (nn) {
      case 0x9e:
        if (this.cpu.keyboard.isKeyPressed(this.cpu.V[x])) {
          this.cpu.pc += 2;
        }
        return `SKP V${x.toString(16)}`;
      case 0xa1:
        if (!this.cpu.keyboard.isKeyPressed(this.cpu.V[x])) {
          this.cpu.pc += 2;
        }
        return `SKNP V${x.toString(16)}`;
    }
  }

  executeFCommands(x, nn) {
    switch (nn) {
      case 0x07:
        this.cpu.V[x] = this.cpu.timer.getDelay();
        return `LD V${x.toString(16)}, DT`;
      case 0x0a:
        this.cpu.keyboard.waitForKeyPress((key) => {
          this.cpu.V[x] = key;
        });
        return `LD V${x.toString(16)}, K`;
      case 0x15:
        this.cpu.timer.setDelay(this.cpu.V[x]);
        return `LD DT, V${x.toString(16)}`;
      case 0x18:
        this.cpu.timer.setSound(this.cpu.V[x]);
        return `LD ST, V${x.toString(16)}`;
      case 0x1e:
        this.cpu.I += this.cpu.V[x];
        return `ADD I, V${x.toString(16)}`;
      case 0x29:
        this.cpu.I = this.cpu.V[x] * 5;
        return `LD F, V${x.toString(16)}`;
      case 0x33:
        const value = this.cpu.V[x];
        this.cpu.memory.write(this.cpu.I, Math.floor(value / 100));
        this.cpu.memory.write(this.cpu.I + 1, Math.floor((value % 100) / 10));
        this.cpu.memory.write(this.cpu.I + 2, value % 10);
        return `LD B, V${x.toString(16)}`;
      case 0x55:
        for (let i = 0; i <= x; i++) {
          this.cpu.memory.write(this.cpu.I + i, this.cpu.V[i]);
        }
        return `LD [I], V${x.toString(16)}`;
      case 0x65:
        for (let i = 0; i <= x; i++) {
          this.cpu.V[i] = this.cpu.memory.read(this.cpu.I + i);
        }
        return `LD V${x.toString(16)}, [I]`;
    }
  }
}
