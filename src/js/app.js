function App() {
  try {
    // State management
    const [chip8, setChip8] = React.useState(null);
    const [isRunning, setIsRunning] = React.useState(false);
    const [cpuSpeed, setCpuSpeed] = React.useState(DEFAULT_CPU_SPEED);
    const [currentRom, setCurrentRom] = React.useState(null);
    const [error, setError] = React.useState(null);
    
    // Initialize CHIP-8 emulator
    React.useEffect(() => {
      try {
        const emulator = new Chip8();
        setChip8(emulator);
        console.log('CHIP-8 emulator initialized');
      } catch (error) {
        console.error('Failed to initialize CHIP-8 emulator:', error);
        setError('Failed to initialize emulator: ' + error.message);
        reportError(error);
      }
    }, []);
    
    // Main emulation loop
    React.useEffect(() => {
      if (!chip8 || !isRunning) return;
      
      let lastTime = 0;
      let timerLastTime = 0;
      let animationId = null;
      const cpuInterval = 1000 / cpuSpeed; // Time per instruction in ms
      const timerInterval = 1000 / 60; // 60Hz timer rate
      
      const runEmulation = (timestamp) => {
        if (!isRunning) return;
        
        // Calculate elapsed time since last cycle
        const elapsed = timestamp - lastTime;
        
        // Run CPU cycles based on the current speed setting
        if (elapsed >= cpuInterval) {
          chip8.cycle();
          lastTime = timestamp;
        }
        
        // Update timers at 60Hz
        const timerElapsed = timestamp - timerLastTime;
        if (timerElapsed >= timerInterval) {
          chip8.updateTimers();
          timerLastTime = timestamp;
        }
        
        animationId = requestAnimationFrame(runEmulation);
      };
      
      animationId = requestAnimationFrame(runEmulation);
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        if (chip8) {
          chip8.paused = true;
        }
      };
    }, [chip8, isRunning, cpuSpeed]);
    
    // Handle ROM selection
    const handleRomSelect = async (rom) => {
      try {
        if (!chip8) return;
        
        setError(null);
        setIsRunning(false);
        
        let romBuffer;
        
        // If ROM already has a buffer, use it directly (from file upload)
        if (rom.buffer) {
          romBuffer = rom.buffer;
        } else {
          // Otherwise fetch from URL or use embedded data
          setCurrentRom({ ...rom, status: 'loading' });
          romBuffer = await fetchRom(rom);
        }
        
        // Load ROM into emulator
        chip8.loadROM(romBuffer);
        setCurrentRom({ ...rom, status: 'loaded' });
        
        // Automatically start emulation after loading ROM
        setIsRunning(true);
      } catch (error) {
        console.error('Failed to load ROM:', error);
        setError(`Failed to load ROM: ${error.message}`);
        setCurrentRom({ ...rom, status: 'error' });
        reportError(error);
      }
    };
    
    // Handle reset
    const handleReset = () => {
      if (!chip8 || !currentRom) return;
      
      setIsRunning(false);
      
      // If we have a current ROM with a buffer, reload it directly
      if (currentRom.buffer) {
        chip8.loadROM(currentRom.buffer);
      } else {
        // Otherwise, we need to fetch it again
        handleRomSelect(currentRom);
        return; // handleRomSelect will handle starting the emulation
      }
      
      // Start emulation after reset
      setIsRunning(true);
    };
    
    // Handle step (execute a single instruction)
    const handleStep = () => {
      if (!chip8 || isRunning) return;
      chip8.cycle();
    };
    
    // Preload ROMs with their data
    const [defaultRoms, setDefaultRoms] = React.useState([]);
    
    React.useEffect(() => {
      // For each default ROM, add a preload function
      const preloadedRoms = DEFAULT_ROMS.map(rom => ({
        ...rom,
        preload: async () => {
          try {
            const buffer = await fetchRom(rom);
            return buffer;
          } catch (error) {
            console.error(`Failed to preload ROM ${rom.name}:`, error);
            return null;
          }
        }
      }));
      
      setDefaultRoms(preloadedRoms);
    }, []);
    
    return (
      <div data-name="app-container" className="min-h-screen bg-gray-900 text-white p-4">
        <header data-name="app-header" className="mb-6 text-center">
          <h1 data-name="app-title" className="text-3xl font-bold mb-2">CHIP-8 Emulator</h1>
          <p data-name="app-subtitle" className="text-gray-400">
            Play classic games from the 1970s directly in your browser
          </p>
        </header>
        
        {error && (
          <div data-name="error-message" className="bg-red-900 text-white p-3 rounded-md mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div data-name="app-layout" className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div data-name="main-column" className="md:col-span-2 flex flex-col">
            {chip8 && (
              <React.Fragment>
                <Display chip8={chip8} scale={8} />
                <ControlPanel 
                  chip8={chip8}
                  cpuSpeed={cpuSpeed}
                  setCpuSpeed={setCpuSpeed}
                  isRunning={isRunning}
                  setIsRunning={setIsRunning}
                  handleReset={handleReset}
                  handleStep={handleStep}
                />
                <Keypad chip8={chip8} />
                <DebugPanel chip8={chip8} expanded={false} />
              </React.Fragment>
            )}
          </div>
          
          <div data-name="sidebar-column" className="flex flex-col">
            <RomSelector 
              onRomSelect={handleRomSelect} 
              defaultRoms={defaultRoms}
            />
            <InfoPanel />
          </div>
        </div>
        
        <footer data-name="app-footer" className="mt-8 text-center text-sm text-gray-500">
          <p>CHIP-8 Emulator - Built with React</p>
          <p className="mt-1">
            <a 
              href="https://github.com/mattmikolay/chip-8/wiki/CHIP%E2%80%908-Technical-Reference" 
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              CHIP-8 Technical Reference
            </a>
          </p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    reportError(error);
    return <div data-name="app-error" className="text-red-500">Application error: {error.message}</div>;
  }
}

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
