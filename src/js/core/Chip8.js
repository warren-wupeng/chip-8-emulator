class Chip8 {
  constructor() {
    try {
      // Initialize memory and registers
      this.reset();
      
      // CPU speed control
      this.speed = DEFAULT_CPU_SPEED;
      this.lastCycleTime = 0;
      this.paused = true;
      
      // Debug info
      this.lastOpcode = 0;
      this.lastInstruction = '';
    } catch (error) {
      console.error('Error initializing CHIP-8:', error);
      reportError(error);
    }
  }
  
  reset() {
    try {
      // Main memory - 4KB (4096 bytes)
      this.memory = new Uint8Array(MEMORY_SIZE);
      
      // Display - 64x32 pixels
      this.display = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT).fill(0);
      
      // Registers - 16 general purpose (V0-VF)
      this.V = new Uint8Array(NUM_REGISTERS);
      
      // Index register (I)
      this.I = 0;
      
      // Program counter (PC)
      this.pc = PROGRAM_START_ADDRESS;
      
      // Stack for subroutines - 16 levels
      this.stack = new Uint16Array(STACK_SIZE);
      this.sp = 0; // Stack pointer
      
      // Timers
      this.delayTimer = 0;
      this.soundTimer = 0;
      
      // Keypad - 16 keys (0-F)
      this.keypad = new Array(NUM_KEYS).fill(0);
      
      // Load fontset into memory
      for (let i = 0; i < FONTSET_SIZE; i++) {
        this.memory[FONTSET_START_ADDRESS + i] = FONTSET[i];
      }
      
      // Draw flag - indicates when to update the display
      this.drawFlag = false;
      
      // Sound flag - indicates when to play sound
      this.soundFlag = false;
      
      // Waiting for key press
      this.waitingForKeyPress = false;
      this.keyRegister = 0;
      
      // Reset debug info
      this.lastOpcode = 0;
      this.lastInstruction = '';
    } catch (error) {
      console.error('Error resetting CHIP-8:', error);
      reportError(error);
    }
  }
  
  loadROM(romBuffer) {
    try {
      this.reset();
      
      // Load ROM into memory starting at 0x200 (512)
      for (let i = 0; i < romBuffer.length; i++) {
        if (PROGRAM_START_ADDRESS + i < MEMORY_SIZE) {
          this.memory[PROGRAM_START_ADDRESS + i] = romBuffer[i];
        } else {
          console.warn('ROM too large for memory');
          break;
        }
      }
      
      console.log(`Loaded ROM: ${romBuffer.length} bytes`);
      this.paused = false;
    } catch (error) {
      console.error('Error loading ROM:', error);
      reportError(error);
    }
  }
  
  cycle() {
    try {
      if (this.paused || this.waitingForKeyPress) {
        return;
      }
      
      // Fetch opcode (2 bytes)
      const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
      this.lastOpcode = opcode;
      
      // Increment program counter before execution
      this.pc += 2;
      
      // Decode and execute opcode
      this.executeOpcode(opcode);
      
    } catch (error) {
      console.error('Error during CPU cycle:', error);
      reportError(error);
      this.paused = true;
    }
  }
  
  updateTimers() {
    try {
      if (this.delayTimer > 0) {
        this.delayTimer--;
      }
      
      if (this.soundTimer > 0) {
        this.soundFlag = true;
        this.soundTimer--;
      } else {
        this.soundFlag = false;
      }
    } catch (error) {
      console.error('Error updating timers:', error);
      reportError(error);
    }
  }
  
  setKeyState(key, pressed) {
    try {
      if (key >= 0 && key < NUM_KEYS) {
        this.keypad[key] = pressed ? 1 : 0;
        
        // If waiting for a key press and a key was pressed
        if (this.waitingForKeyPress && pressed) {
          this.V[this.keyRegister] = key;
          this.waitingForKeyPress = false;
        }
      }
    } catch (error) {
      console.error('Error setting key state:', error);
      reportError(error);
    }
  }
  
  executeOpcode(opcode) {
    try {
      // Extract common opcode components
      const x = (opcode & 0x0F00) >> 8;
      const y = (opcode & 0x00F0) >> 4;
      const n = opcode & 0x000F;
      const nn = opcode & 0x00FF;
      const nnn = opcode & 0x0FFF;
      
      // First digit determines the main operation group
      switch (opcode & 0xF000) {
        case 0x0000:
          switch (opcode) {
            case 0x00E0: // CLS - Clear the display
              this.display.fill(0);
              this.drawFlag = true;
              this.lastInstruction = 'CLS';
              break;
              
            case 0x00EE: // RET - Return from a subroutine
              this.sp--;
              this.pc = this.stack[this.sp];
              this.lastInstruction = 'RET';
              break;
              
            default:
              console.warn(`Unknown opcode: ${formatOpcode(opcode)}`);
              this.lastInstruction = 'UNKNOWN';
          }
          break;
          
        case 0x1000: // JP addr - Jump to location nnn
          this.pc = nnn;
          this.lastInstruction = `JP ${formatOpcode(nnn)}`;
          break;
          
        case 0x2000: // CALL addr - Call subroutine at nnn
          this.stack[this.sp] = this.pc;
          this.sp++;
          this.pc = nnn;
          this.lastInstruction = `CALL ${formatOpcode(nnn)}`;
          break;
          
        case 0x3000: // SE Vx, byte - Skip next instruction if Vx = nn
          if (this.V[x] === nn) {
            this.pc += 2;
          }
          this.lastInstruction = `SE V${x.toString(16).toUpperCase()}, ${formatOpcode(nn)}`;
          break;
          
        case 0x4000: // SNE Vx, byte - Skip next instruction if Vx != nn
          if (this.V[x] !== nn) {
            this.pc += 2;
          }
          this.lastInstruction = `SNE V${x.toString(16).toUpperCase()}, ${formatOpcode(nn)}`;
          break;
          
        case 0x5000: // SE Vx, Vy - Skip next instruction if Vx = Vy
          if (this.V[x] === this.V[y]) {
            this.pc += 2;
          }
          this.lastInstruction = `SE V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
          break;
          
        case 0x6000: // LD Vx, byte - Set Vx = nn
          this.V[x] = nn;
          this.lastInstruction = `LD V${x.toString(16).toUpperCase()}, ${formatOpcode(nn)}`;
          break;
          
        case 0x7000: // ADD Vx, byte - Set Vx = Vx + nn
          this.V[x] = (this.V[x] + nn) & 0xFF; // Ensure 8-bit result
          this.lastInstruction = `ADD V${x.toString(16).toUpperCase()}, ${formatOpcode(nn)}`;
          break;
          
        case 0x8000:
          switch (n) {
            case 0x0: // LD Vx, Vy - Set Vx = Vy
              this.V[x] = this.V[y];
              this.lastInstruction = `LD V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0x1: // OR Vx, Vy - Set Vx = Vx OR Vy
              this.V[x] |= this.V[y];
              this.lastInstruction = `OR V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0x2: // AND Vx, Vy - Set Vx = Vx AND Vy
              this.V[x] &= this.V[y];
              this.lastInstruction = `AND V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0x3: // XOR Vx, Vy - Set Vx = Vx XOR Vy
              this.V[x] ^= this.V[y];
              this.lastInstruction = `XOR V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0x4: // ADD Vx, Vy - Set Vx = Vx + Vy, set VF = carry
              const sum = this.V[x] + this.V[y];
              this.V[0xF] = sum > 0xFF ? 1 : 0; // Set carry flag
              this.V[x] = sum & 0xFF; // 8-bit addition
              this.lastInstruction = `ADD V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0x5: // SUB Vx, Vy - Set Vx = Vx - Vy, set VF = NOT borrow
              this.V[0xF] = this.V[x] > this.V[y] ? 1 : 0; // Set NOT borrow flag
              this.V[x] = (this.V[x] - this.V[y]) & 0xFF; // 8-bit subtraction
              this.lastInstruction = `SUB V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0x6: // SHR Vx - Set Vx = Vx SHR 1 (divide by 2)
              this.V[0xF] = this.V[x] & 0x1; // Store LSB in VF
              this.V[x] >>= 1;
              this.lastInstruction = `SHR V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x7: // SUBN Vx, Vy - Set Vx = Vy - Vx, set VF = NOT borrow
              this.V[0xF] = this.V[y] > this.V[x] ? 1 : 0; // Set NOT borrow flag
              this.V[x] = (this.V[y] - this.V[x]) & 0xFF; // 8-bit subtraction
              this.lastInstruction = `SUBN V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
              break;
              
            case 0xE: // SHL Vx - Set Vx = Vx SHL 1 (multiply by 2)
              this.V[0xF] = (this.V[x] & 0x80) >> 7; // Store MSB in VF
              this.V[x] = (this.V[x] << 1) & 0xFF;
              this.lastInstruction = `SHL V${x.toString(16).toUpperCase()}`;
              break;
              
            default:
              console.warn(`Unknown opcode: ${formatOpcode(opcode)}`);
              this.lastInstruction = 'UNKNOWN';
          }
          break;
          
        case 0x9000: // SNE Vx, Vy - Skip next instruction if Vx != Vy
          if (this.V[x] !== this.V[y]) {
            this.pc += 2;
          }
          this.lastInstruction = `SNE V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}`;
          break;
          
        case 0xA000: // LD I, addr - Set I = nnn
          this.I = nnn;
          this.lastInstruction = `LD I, ${formatOpcode(nnn)}`;
          break;
          
        case 0xB000: // JP V0, addr - Jump to location nnn + V0
          this.pc = nnn + this.V[0];
          this.lastInstruction = `JP V0, ${formatOpcode(nnn)}`;
          break;
          
        case 0xC000: // RND Vx, byte - Set Vx = random byte AND nn
          this.V[x] = getRandomInt(0, 255) & nn;
          this.lastInstruction = `RND V${x.toString(16).toUpperCase()}, ${formatOpcode(nn)}`;
          break;
          
        case 0xD000: // DRW Vx, Vy, nibble - Display n-byte sprite at (Vx, Vy), set VF = collision
          const xCoord = this.V[x] % DISPLAY_WIDTH;
          const yCoord = this.V[y] % DISPLAY_HEIGHT;
          let height = n;
          
          this.V[0xF] = 0; // Reset collision flag
          
          for (let row = 0; row < height; row++) {
            const spriteByte = this.memory[this.I + row];
            
            for (let col = 0; col < 8; col++) {
              // Check if current pixel in sprite is set
              if ((spriteByte & (0x80 >> col)) !== 0) {
                const pixelPos = ((yCoord + row) % DISPLAY_HEIGHT) * DISPLAY_WIDTH + ((xCoord + col) % DISPLAY_WIDTH);
                
                // Check for collision
                if (this.display[pixelPos] === 1) {
                  this.V[0xF] = 1;
                }
                
                // XOR pixel
                this.display[pixelPos] ^= 1;
              }
            }
          }
          
          this.drawFlag = true;
          this.lastInstruction = `DRW V${x.toString(16).toUpperCase()}, V${y.toString(16).toUpperCase()}, ${n}`;
          break;
          
        case 0xE000:
          switch (nn) {
            case 0x9E: // SKP Vx - Skip next instruction if key with the value of Vx is pressed
              if (this.keypad[this.V[x]] === 1) {
                this.pc += 2;
              }
              this.lastInstruction = `SKP V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0xA1: // SKNP Vx - Skip next instruction if key with the value of Vx is not pressed
              if (this.keypad[this.V[x]] === 0) {
                this.pc += 2;
              }
              this.lastInstruction = `SKNP V${x.toString(16).toUpperCase()}`;
              break;
              
            default:
              console.warn(`Unknown opcode: ${formatOpcode(opcode)}`);
              this.lastInstruction = 'UNKNOWN';
          }
          break;
          
        case 0xF000:
          switch (nn) {
            case 0x07: // LD Vx, DT - Set Vx = delay timer value
              this.V[x] = this.delayTimer;
              this.lastInstruction = `LD V${x.toString(16).toUpperCase()}, DT`;
              break;
              
            case 0x0A: // LD Vx, K - Wait for a key press, store the value of the key in Vx
              this.waitingForKeyPress = true;
              this.keyRegister = x;
              this.lastInstruction = `LD V${x.toString(16).toUpperCase()}, K`;
              break;
              
            case 0x15: // LD DT, Vx - Set delay timer = Vx
              this.delayTimer = this.V[x];
              this.lastInstruction = `LD DT, V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x18: // LD ST, Vx - Set sound timer = Vx
              this.soundTimer = this.V[x];
              this.lastInstruction = `LD ST, V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x1E: // ADD I, Vx - Set I = I + Vx
              this.I += this.V[x];
              // Some implementations set VF if I overflows past 0xFFF
              if (this.I > 0xFFF) {
                this.V[0xF] = 1;
                this.I &= 0xFFF;
              }
              this.lastInstruction = `ADD I, V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x29: // LD F, Vx - Set I = location of sprite for digit Vx
              this.I = FONTSET_START_ADDRESS + (this.V[x] * 5);
              this.lastInstruction = `LD F, V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x33: // LD B, Vx - Store BCD representation of Vx in memory locations I, I+1, and I+2
              this.memory[this.I] = Math.floor(this.V[x] / 100);
              this.memory[this.I + 1] = Math.floor((this.V[x] % 100) / 10);
              this.memory[this.I + 2] = this.V[x] % 10;
              this.lastInstruction = `LD B, V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x55: // LD [I], Vx - Store registers V0 through Vx in memory starting at location I
              for (let i = 0; i <= x; i++) {
                this.memory[this.I + i] = this.V[i];
              }
              // On original CHIP-8, I would be set to I + x + 1 after this operation
              // this.I += x + 1;
              this.lastInstruction = `LD [I], V${x.toString(16).toUpperCase()}`;
              break;
              
            case 0x65: // LD Vx, [I] - Read registers V0 through Vx from memory starting at location I
              for (let i = 0; i <= x; i++) {
                this.V[i] = this.memory[this.I + i];
              }
              // On original CHIP-8, I would be set to I + x + 1 after this operation
              // this.I += x + 1;
              this.lastInstruction = `LD V${x.toString(16).toUpperCase()}, [I]`;
              break;
              
            default:
              console.warn(`Unknown opcode: ${formatOpcode(opcode)}`);
              this.lastInstruction = 'UNKNOWN';
          }
          break;
          
        default:
          console.warn(`Unknown opcode: ${formatOpcode(opcode)}`);
          this.lastInstruction = 'UNKNOWN';
      }
    } catch (error) {
      console.error('Error executing opcode:', error);
      reportError(error);
      this.paused = true;
    }
  }
}
