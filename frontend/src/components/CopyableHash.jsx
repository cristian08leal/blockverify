import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard, truncateHex } from '../utils';
import './CopyableHash.css';

/**
 * CopyableHash — renders a truncated hash/address with a copy button.
 * Props:
 *   value     {string} full hash string
 *   start     {number} leading chars (default 10)
 *   end       {number} trailing chars (default 8)
 *   full      {boolean} if true, show full value (no truncation)
 */
export default function CopyableHash({ value, start = 10, end = 8, full = false }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const display = full ? value : truncateHex(value, start, end);

  return (
    <span className="copyable-hash">
      <span className="copyable-hash-value" title={value}>{display}</span>
      <button
        className={`copyable-hash-btn${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        title={copied ? '¡Copiado!' : 'Copiar al portapapeles'}
      >
        {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2} />}
      </button>
    </span>
  );
}
