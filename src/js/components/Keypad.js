function Keypad({ chip8 }) {
  try {
    const [activeKeys, setActiveKeys] = React.useState({});
    const keypadRef = React.useRef(null);
    
    // Define keypad layout
    const keyLayout = [
      ['1', '2', '3', '4'],
      ['q', 'w', 'e', 'r'],
      ['a', 's', 'd', 'f'],
      ['z', 'x', 'c', 'v']
    ];
    
    // Handle keyboard events
    React.useEffect(() => {
      if (!chip8) return;
      
      const handleKeyDown = (event) => {
        const key = event.key.toLowerCase();
        if (KEY_MAP.hasOwnProperty(key)) {
          const chipKey = KEY_MAP[key];
          chip8.setKeyState(chipKey, true);
          setActiveKeys(prev => ({ ...prev, [key]: true }));
        }
      };
      
      const handleKeyUp = (event) => {
        const key = event.key.toLowerCase();
        if (KEY_MAP.hasOwnProperty(key)) {
          const chipKey = KEY_MAP[key];
          chip8.setKeyState(chipKey, false);
          setActiveKeys(prev => ({ ...prev, [key]: false }));
        }
      };
      
      // Add event listeners
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [chip8]);
    
    // Handle touch/click events for virtual keypad
    const handleKeyPress = (key, pressed) => {
      if (!chip8 || !KEY_MAP.hasOwnProperty(key)) return;
      
      const chipKey = KEY_MAP[key];
      chip8.setKeyState(chipKey, pressed);
      setActiveKeys(prev => ({ ...prev, [key]: pressed }));
    };
    
    return (
      <div data-name="keypad-container" ref={keypadRef} className="mb-4">
        <h3 data-name="keypad-title" className="text-lg font-semibold mb-2">Keypad</h3>
        <div data-name="keypad-description" className="text-sm text-gray-400 mb-2">
          Use keyboard or tap/click buttons
        </div>
        <div data-name="keypad-grid" className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
          {keyLayout.map((row, rowIndex) => (
            row.map((key, colIndex) => {
              // Get the CHIP-8 key value for this key
              const chipKey = KEY_MAP[key];
              const isActive = activeKeys[key];
              
              return (
                <button
                  data-name={`keypad-button-${key}`}
                  key={`${rowIndex}-${colIndex}`}
                  className={`key-button w-14 h-14 rounded bg-gray-700 text-center flex items-center justify-center text-lg font-mono ${isActive ? 'active' : ''}`}
                  onMouseDown={() => handleKeyPress(key, true)}
                  onMouseUp={() => handleKeyPress(key, false)}
                  onMouseLeave={() => isActive && handleKeyPress(key, false)}
                  onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key, true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleKeyPress(key, false); }}
                >
                  <span className="uppercase">{key}</span>
                  <span className="text-xs text-gray-400 ml-1">({chipKey?.toString(16).toUpperCase()})</span>
                </button>
              );
            })
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Keypad component error:', error);
    reportError(error);
    return <div data-name="keypad-error" className="text-red-500">Keypad error: {error.message}</div>;
  }
}
