// Helper functions

// Generate a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Convert a number to hexadecimal string with padding
function toHex(num, pad = 2) {
  return num.toString(16).toUpperCase().padStart(pad, '0');
}

// Format an opcode for display
function formatOpcode(opcode) {
  return `0x${toHex(opcode, 4)}`;
}

// Parse a ROM file
async function parseRomFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const romBuffer = new Uint8Array(arrayBuffer);
      resolve(romBuffer);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Fetch a ROM from URL or use embedded data
async function fetchRom(romData) {
  try {
    // If we have embedded data, use it directly
    if (romData.data) {
      console.log('Using embedded ROM data');
      return romData.data;
    }
    
    // Otherwise fetch from URL
    if (romData.url) {
      console.log(`Fetching ROM from: ${romData.url}`);
      const response = await fetch(romData.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ROM: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
    
    throw new Error('No ROM data or URL provided');
  } catch (error) {
    console.error('Error fetching ROM:', error);
    reportError(error);
    throw error;
  }
}
