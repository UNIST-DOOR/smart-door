/**
 * Calculate checksum for command data (from MainActivity.kt)
 * @param data Byte array to calculate checksum for
 * @param length Number of bytes to include in calculation  
 * @returns Calculated checksum byte
 */
export const calculateChecksum = (data: number[], length: number): number => {
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += data[i] & 0xFF;
  }
  return sum & 0xFF;
};

/**
 * Convert byte array to hex string for logging
 * @param bytes Array of bytes
 * @returns Hex string representation
 */
export const bytesToHexString = (bytes: number[]): string => {
  return bytes.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
};

/**
 * Generate unique ID for log messages
 * @returns Unique string ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Format timestamp for display
 * @param date Date object
 * @returns Formatted time string
 */
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit', 
    second: '2-digit'
  });
};

/**
 * Check if device name matches target prefix
 * @param deviceName Device name to check
 * @param prefix Target prefix (default: 'unist')
 * @returns True if device matches target
 */
export const isTargetDevice = (deviceName: string | null, prefix: string = 'unist'): boolean => {
  return deviceName !== null && deviceName.toLowerCase().startsWith(prefix.toLowerCase());
};

/**
 * Get current time components for time sync commands (from MainActivity.kt)
 * @returns Object with year, month, date, hour, min in the format expected by MainActivity.kt
 */
export const getCurrentTimeComponents = () => {
  const now = new Date();
  return {
    year: now.getFullYear() % 100,  // 2자리 년도
    month: now.getMonth() + 1,      // 1-12
    date: now.getDate(),            // 1-31
    hour: now.getHours(),           // 0-23
    min: now.getMinutes()           // 0-59
  };
};

/**
 * Parse number text to hex byte array (from MainActivity.kt)
 * @param numberText Input text like "11 22 33 44 55 66 1"
 * @returns Array of up to 7 hex bytes, padded with 0xFF
 */
export const parseNumberText = (numberText: string): number[] => {
  if (!numberText.trim()) {
    return Array(7).fill(0xFF);
  }
  
  // Remove spaces and ensure even length
  const cleanText = numberText.replace(/\s/g, '');
  const paddedText = cleanText.length % 2 !== 0 ? cleanText + 'F' : cleanText;
  
  // Convert to byte pairs and take up to 7 bytes
  const bytePairs = paddedText.match(/.{1,2}/g) || [];
  const numbers = bytePairs.slice(0, 7).map(pair => {
    const parsed = parseInt(pair, 16);
    return isNaN(parsed) ? 0xFF : parsed;
  });
  
  // Pad to 7 bytes with 0xFF
  while (numbers.length < 7) {
    numbers.push(0xFF);
  }
  
  return numbers;
};

/**
 * Parse hex string input to number (from MainActivity.kt)
 * @param text Input text in hex format
 * @param defaultValue Default value if parsing fails
 * @returns Parsed number or default
 */
export const parseHexInput = (text: string, defaultValue: number = 0xFF): number => {
  if (!text.trim()) return defaultValue;
  
  const padded = text.padStart(2, '0');
  const parsed = parseInt(padded, 16);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Generate device name based on user info (building + room)
 * @param building Building info (ex: "301동")
 * @param room Room info (ex: "101")
 * @returns Device name (ex: "unist_301101")
 */
export const generateDeviceName = (building: string, room: string): string => {
  // Extract numbers from building (301동 → 301)
  const buildingNumber = building.replace(/[^0-9]/g, '');
  // Extract numbers from room (101 → 101)
  const roomNumber = room.replace(/[^0-9]/g, '');
  
  return `unist_${buildingNumber}${roomNumber}`;
}; 