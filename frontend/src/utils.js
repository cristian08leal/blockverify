// utils.js — Shared helper utilities

/**
 * Converts a UNIX timestamp (seconds) to a readable local date string.
 * @param {number} ts - Unix timestamp in seconds
 * @returns {string} Formatted date, e.g. "19 jun 2026, 17:30"
 */
export function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = new Date(ts * 1000);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncates a hex string (hash/address) for display.
 * E.g. "0x4bc06523abcdef...7edc"
 * @param {string} hex
 * @param {number} startChars - chars to keep after "0x"
 * @param {number} endChars   - chars to keep at the end
 */
export function truncateHex(hex, startChars = 8, endChars = 6) {
  if (!hex) return '—';
  const str = String(hex);
  if (str.length <= startChars + endChars + 3) return str;
  return `${str.slice(0, startChars + 2)}...${str.slice(-endChars)}`;
}

/**
 * Copies text to clipboard and returns a Promise<boolean>.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the file extension in uppercase, or 'FILE' as fallback.
 */
export function getFileExtension(name) {
  if (!name) return 'FILE';
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
}

/**
 * Formats bytes into a human-readable size string.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
