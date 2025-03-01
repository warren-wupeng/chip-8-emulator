function ControlPanel({ chip8, cpuSpeed, setCpuSpeed, isRunning, setIsRunning, handleReset, handleStep }) {
  try {
    const [volume, setVolume] = React.useState(50);
    const audioContextRef = React.useRef(null);
    const oscillatorRef = React.useRef(null);
    const gainNodeRef = React.useRef(null);
    
    // Initialize audio context
    React.useEffect(() => {
      // Only create audio context on user interaction to comply with browser policies
      const initAudio = () => {
        if (!audioContextRef.current) {
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            
            // Create oscillator
            oscillatorRef.current = audioContextRef.current.createOscillator();
            oscillatorRef.current.type = 'square';
            oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
            
            // Create gain node
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.gain.value = 0; // Start muted
            
            // Connect nodes
            oscillatorRef.current.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContextRef.current.destination);
            
            // Start oscillator
            oscillatorRef.current.start();
          } catch (error) {
            console.error('Failed to initialize audio:', error);
          }
        }
        
        // Remove event listeners
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      };
      
      // Add event listeners for user interaction
      document.addEventListener('click', initAudio);
      document.addEventListener('keydown', initAudio);
      
      return () => {
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
        
        // Clean up audio resources
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
    }, []);
    
    // Handle sound
    React.useEffect(() => {
      if (!chip8 || !gainNodeRef.current) return;
      
      const handleSound = () => {
        if (chip8.soundFlag && gainNodeRef.current) {
          gainNodeRef.current.gain.value = volume / 100;
        } else if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 0;
        }
        
        requestAnimationFrame(handleSound);
      };
      
      const animationId = requestAnimationFrame(handleSound);
      return () => cancelAnimationFrame(animationId);
    }, [chip8, volume]);
    
    // Handle CPU speed change
    const handleSpeedChange = (e) => {
      const newSpeed = parseInt(e.target.value);
      setCpuSpeed(newSpeed);
      if (chip8) {
        chip8.speed = newSpeed;
      }
    };
    
    // Handle volume change
    const handleVolumeChange = (e) => {
      setVolume(parseInt(e.target.value));
    };
    
    return (
      <div data-name="control-panel" className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 data-name="control-panel-title" className="text-lg font-semibold mb-3">Controls</h3>
        
        <div data-name="control-panel-buttons" className="flex flex-wrap gap-2 mb-4">
          <button
            data-name="run-button"
            className={`px-4 py-2 rounded-md font-medium ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
            {isRunning ? 'Pause' : 'Run'}
          </button>
          
          <button
            data-name="step-button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium disabled:opacity-50"
            onClick={handleStep}
            disabled={isRunning}
          >
            <i className="fas fa-step-forward mr-2"></i>
            Step
          </button>
          
          <button
            data-name="reset-button"
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md font-medium"
            onClick={handleReset}
          >
            <i className="fas fa-redo-alt mr-2"></i>
            Reset
          </button>
        </div>
        
        <div data-name="control-panel-sliders" className="space-y-4">
          <div data-name="speed-control">
            <label className="block text-sm font-medium mb-1">
              CPU Speed: {cpuSpeed} Hz
            </label>
            <input
              data-name="speed-slider"
              type="range"
              min="10"
              max="1500"
              step="10"
              value={cpuSpeed}
              onChange={handleSpeedChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div data-name="speed-labels" className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
          
          <div data-name="volume-control">
            <label className="block text-sm font-medium mb-1">
              Sound Volume: {volume}%
            </label>
            <input
              data-name="volume-slider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div data-name="volume-labels" className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Mute</span>
              <span>Max</span>
            </div>
          </div>
        </div>
        
        {chip8?.soundFlag && (
          <div data-name="sound-indicator" className="mt-3 text-xs text-green-400 blink">
            <i className="fas fa-volume-up mr-1"></i> Sound playing
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ControlPanel component error:', error);
    reportError(error);
    return <div data-name="control-panel-error" className="text-red-500">Control Panel error: {error.message}</div>;
  }
}
