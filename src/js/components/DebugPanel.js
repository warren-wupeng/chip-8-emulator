function DebugPanel({ chip8, expanded = false }) {
  try {
    const [isExpanded, setIsExpanded] = React.useState(expanded);
    
    if (!chip8) {
      return null;
    }
    
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };
    
    // Format register values
    const formatRegister = (value) => {
      return `0x${toHex(value)}`;
    };
    
    // Format memory values
    const formatMemory = (address) => {
      if (!chip8.memory) return '0x00';
      return `0x${toHex(chip8.memory[address])}`;
    };
    
    // Get memory around program counter
    const getPcMemory = () => {
      if (!chip8.memory || !chip8.pc) return [];
      
      const memory = [];
      const start = Math.max(0, chip8.pc - 8);
      const end = Math.min(MEMORY_SIZE - 1, chip8.pc + 8);
      
      for (let addr = start; addr <= end; addr += 2) {
        const opcode = (chip8.memory[addr] << 8) | chip8.memory[addr + 1];
        memory.push({
          address: addr,
          opcode: opcode,
          isCurrent: addr === chip8.pc - 2 // PC has already been incremented after execution
        });
      }
      
      return memory;
    };
    
    return (
      <div data-name="debug-panel" className="bg-gray-800 p-4 rounded-lg mb-4 debug-panel">
        <div data-name="debug-header" className="flex justify-between items-center mb-3">
          <h3 data-name="debug-title" className="text-lg font-semibold">Debug</h3>
          <button
            data-name="expand-button"
            onClick={toggleExpand}
            className="text-gray-400 hover:text-white"
          >
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </button>
        </div>
        
        {isExpanded && (
          <div data-name="debug-content" className="space-y-4">
            <div data-name="opcode-section">
              <h4 data-name="opcode-title" className="font-medium text-sm mb-1">Last Opcode</h4>
              <div data-name="opcode-value" className="bg-gray-900 p-2 rounded">
                <span className="text-yellow-400">{formatOpcode(chip8.lastOpcode)}</span>
                {chip8.lastInstruction && (
                  <span className="ml-2 text-gray-400">({chip8.lastInstruction})</span>
                )}
              </div>
            </div>
            
            <div data-name="registers-section">
              <h4 data-name="registers-title" className="font-medium text-sm mb-1">Registers</h4>
              <div data-name="registers-grid" className="grid grid-cols-4 gap-2 text-xs">
                {Array.from({ length: NUM_REGISTERS }).map((_, i) => (
                  <div 
                    data-name={`register-${i}`}
                    key={i} 
                    className={`p-1 rounded ${i === 0xF ? 'bg-blue-900' : 'bg-gray-900'}`}
                  >
                    V{i.toString(16).toUpperCase()}: <span className="register-value">{formatRegister(chip8.V[i])}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div data-name="special-registers" className="grid grid-cols-2 gap-2 text-xs">
              <div data-name="register-i" className="p-1 rounded bg-gray-900">
                I: <span className="register-value">{formatRegister(chip8.I)}</span>
              </div>
              <div data-name="register-pc" className="p-1 rounded bg-gray-900">
                PC: <span className="register-value">{`0x${toHex(chip8.pc, 4)}`}</span>
              </div>
              <div data-name="register-sp" className="p-1 rounded bg-gray-900">
                SP: <span className="register-value">{formatRegister(chip8.sp)}</span>
              </div>
              <div data-name="register-dt" className="p-1 rounded bg-gray-900">
                DT: <span className="register-value">{formatRegister(chip8.delayTimer)}</span>
              </div>
            </div>
            
            <div data-name="memory-section">
              <h4 data-name="memory-title" className="font-medium text-sm mb-1">Memory (PC ± 8 bytes)</h4>
              <div data-name="memory-list" className="bg-gray-900 p-2 rounded text-xs font-mono">
                {getPcMemory().map((item) => (
                  <div
                    data-name={`memory-${item.address}`}
                    key={item.address}
                    className={`${item.isCurrent ? 'bg-blue-900' : ''} rounded px-1`}
                  >
                    {`0x${toHex(item.address, 4)}: ${formatOpcode(item.opcode)}`}
                    {item.isCurrent && <span className="ml-2 text-yellow-400">←</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('DebugPanel component error:', error);
    reportError(error);
    return <div data-name="debug-panel-error" className="text-red-500">Debug Panel error: {error.message}</div>;
  }
}
