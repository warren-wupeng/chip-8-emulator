function RomSelector({ onRomSelect, defaultRoms }) {
  try {
    const [selectedCategory, setSelectedCategory] = React.useState('games');
    const [loadingStates, setLoadingStates] = React.useState({});
    const fileInputRef = React.useRef(null);

    // Group ROMs by category
    const romCategories = React.useMemo(() => {
      const categories = {};
      defaultRoms.forEach(rom => {
        if (!categories[rom.category]) {
          categories[rom.category] = [];
        }
        categories[rom.category].push(rom);
      });
      return categories;
    }, [defaultRoms]);
    
    // Handle ROM selection from default list
    const handleRomClick = async (rom) => {
      try {
        // Set loading state for this ROM
        setLoadingStates(prev => ({ ...prev, [rom.name]: true }));
        
        // Try to load the ROM
        await onRomSelect(rom);
        
        // Clear loading state on success
        setLoadingStates(prev => ({ ...prev, [rom.name]: false }));
      } catch (error) {
        // Clear loading state and show error
        setLoadingStates(prev => ({ ...prev, [rom.name]: false }));
        console.error('Error loading ROM:', error);
        reportError(error);
      }
    };
    
    // Handle custom ROM file upload
    const handleFileUpload = async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        
        // Update loading state
        setLoadingStates(prev => ({ ...prev, [file.name]: true }));
        
        const romBuffer = await parseRomFile(file);
        
        await onRomSelect({
          name: file.name,
          description: 'Custom ROM',
          buffer: romBuffer
        });
        
        // Clear loading state
        setLoadingStates(prev => ({ ...prev, [file.name]: false }));
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Error loading ROM file:', error);
        reportError(error);
        alert(`Failed to load ROM: ${error.message}`);
      }
    };
    
    // Trigger file input click
    const handleUploadClick = () => {
      fileInputRef.current.click();
    };
    
    // Get unique categories from ROMs
    const categories = Object.keys(romCategories).sort((a, b) => {
      // Put 'embedded' category last
      if (a === 'embedded') return 1;
      if (b === 'embedded') return -1;
      return a.localeCompare(b);
    });
    
    return (
      <div data-name="rom-selector-container" className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 data-name="rom-selector-title" className="text-lg font-semibold mb-3">Select ROM</h3>
        
        <div data-name="rom-upload-section" className="mb-4">
          <button
            data-name="upload-button"
            onClick={handleUploadClick}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium flex items-center justify-center"
          >
            <i className="fas fa-upload mr-2"></i>
            Upload ROM File
          </button>
          <input
            data-name="file-input"
            ref={fileInputRef}
            type="file"
            accept=".ch8,.rom,.bin"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p data-name="upload-hint" className="text-xs text-gray-400 mt-1 text-center">
            Accepts .ch8, .rom, and .bin files
          </p>
        </div>
        
        <div data-name="rom-categories" className="flex flex-wrap mb-3 border-b border-gray-700">
          {categories.map(category => (
            <button
              data-name={`category-${category}`}
              key={category}
              className={`px-3 py-2 text-sm font-medium ${
                selectedCategory === category 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-1 text-xs text-gray-500">
                ({romCategories[category].length})
              </span>
            </button>
          ))}
        </div>
        
        <div data-name="rom-list" className="rom-selector space-y-1">
          {romCategories[selectedCategory]?.map((rom, index) => (
            <div
              data-name={`rom-item-${index}`}
              key={index}
              className={`p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors ${
                loadingStates[rom.name] ? 'opacity-50' : ''
              }`}
              onClick={() => !loadingStates[rom.name] && handleRomClick(rom)}
            >
              <div data-name={`rom-header-${index}`} className="flex justify-between items-center">
                <div data-name={`rom-name-${index}`} className="font-medium">
                  {rom.name}
                  {rom.data && (
                    <span className="ml-2 text-xs text-green-400">
                      <i className="fas fa-bolt"></i> Instant Load
                    </span>
                  )}
                </div>
                {loadingStates[rom.name] && (
                  <div data-name={`rom-loading-${index}`} className="text-blue-400">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>
              {rom.description && (
                <div data-name={`rom-description-${index}`} className="text-xs text-gray-400 mt-1">
                  {rom.description}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {romCategories[selectedCategory]?.length === 0 && (
          <div data-name="no-roms-message" className="text-center text-gray-400 py-4">
            No ROMs available in this category
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('RomSelector component error:', error);
    reportError(error);
    return <div data-name="rom-selector-error" className="text-red-500">ROM Selector error: {error.message}</div>;
  }
}
