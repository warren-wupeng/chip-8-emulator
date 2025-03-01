function Display({ chip8, scale = 10 }) {
  try {
    const canvasRef = React.useRef(null);
    const [fps, setFps] = React.useState(0);
    const [frameCount, setFrameCount] = React.useState(0);
    const lastFrameTimeRef = React.useRef(Date.now());
    const frameCountRef = React.useRef(0);
    
    // Create off-screen canvas for better performance
    const offscreenCanvasRef = React.useRef(null);
    
    React.useEffect(() => {
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = DISPLAY_WIDTH;
        offscreenCanvasRef.current.height = DISPLAY_HEIGHT;
      }
    }, []);
    
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !chip8) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = DISPLAY_WIDTH * scale;
      canvas.height = DISPLAY_HEIGHT * scale;
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update FPS counter every second
      const fpsInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastFrameTimeRef.current;
        if (elapsed > 0) {
          const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
          setFps(currentFps);
          lastFrameTimeRef.current = now;
          frameCountRef.current = 0;
        }
      }, 1000);
      
      return () => {
        clearInterval(fpsInterval);
      };
    }, [chip8, scale]);
    
    // Render function to update display when needed
    React.useEffect(() => {
      if (!chip8 || !canvasRef.current) return;
      
      const renderFrame = () => {
        if (chip8.drawFlag) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Use offscreen canvas for better performance
          const offCtx = offscreenCanvasRef.current.getContext('2d');
          const imageData = offCtx.createImageData(DISPLAY_WIDTH, DISPLAY_HEIGHT);
          
          // Update pixel data
          for (let i = 0; i < chip8.display.length; i++) {
            const color = chip8.display[i] ? 255 : 0;
            imageData.data[i * 4] = color;     // R
            imageData.data[i * 4 + 1] = color; // G
            imageData.data[i * 4 + 2] = color; // B
            imageData.data[i * 4 + 3] = 255;   // A
          }
          
          offCtx.putImageData(imageData, 0, 0);
          
          // Clear main canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the scaled image to the main canvas
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            offscreenCanvasRef.current,
            0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT,
            0, 0, canvas.width, canvas.height
          );
          
          chip8.drawFlag = false;
          frameCountRef.current++;
          setFrameCount(prev => prev + 1);
        }
        
        requestAnimationFrame(renderFrame);
      };
      
      const animationId = requestAnimationFrame(renderFrame);
      return () => cancelAnimationFrame(animationId);
    }, [chip8]);
    
    return (
      <div data-name="display-container" className="chip8-display flex flex-col items-center mb-4">
        <canvas 
          data-name="display-canvas" 
          ref={canvasRef} 
          className="mb-2"
        />
        <div data-name="display-info" className="text-xs text-gray-400">
          FPS: {fps} | Frame: {frameCount}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Display component error:', error);
    reportError(error);
    return <div data-name="display-error" className="text-red-500">Display error: {error.message}</div>;
  }
}
