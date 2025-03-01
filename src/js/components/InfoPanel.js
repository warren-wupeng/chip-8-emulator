function InfoPanel() {
  try {
    return (
      <div data-name="info-panel" className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 data-name="info-panel-title" className="text-lg font-semibold mb-3">CHIP-8 Emulator</h3>
        
        <div data-name="info-content" className="space-y-3 text-sm">
          <p>
            CHIP-8 is an interpreted programming language developed in the mid-1970s, 
            initially used on the COSMAC VIP and Telmac 1800 microcomputers.
          </p>
          
          <div data-name="keyboard-info">
            <h4 className="font-medium mb-1">Keyboard Mapping:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Original:</span>
                <pre className="text-xs bg-gray-900 p-1 rounded mt-1">
                  1 2 3 C<br/>
                  4 5 6 D<br/>
                  7 8 9 E<br/>
                  A 0 B F
                </pre>
              </div>
              <div>
                <span className="text-gray-400">Mapped to:</span>
                <pre className="text-xs bg-gray-900 p-1 rounded mt-1">
                  1 2 3 4<br/>
                  Q W E R<br/>
                  A S D F<br/>
                  Z X C V
                </pre>
              </div>
            </div>
          </div>
          
          <div data-name="resources">
            <h4 className="font-medium">Resources:</h4>
            <ul className="list-disc list-inside text-blue-400">
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/CHIP-8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:underline"
                >
                  CHIP-8 on Wikipedia
                </a>
              </li>
              <li>
                <a 
                  href="http://www.cs.columbia.edu/~sedwards/classes/2016/4840-spring/designs/Chip8.pdf" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:underline"
                >
                  CHIP-8 Technical Reference
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('InfoPanel component error:', error);
    reportError(error);
    return <div data-name="info-panel-error" className="text-red-500">Info Panel error: {error.message}</div>;
  }
}
