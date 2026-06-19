import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { getFileExtension, formatFileSize } from '../utils';
import './DropZone.css';

/**
 * DropZone — reusable drag-and-drop file picker.
 * Props:
 *   file     {File|null}  currently selected file
 *   onFile   {function}   callback(File|null)
 *   accept   {string}     MIME types / extensions (optional)
 *   disabled {boolean}
 */
export default function DropZone({ file, onFile, accept, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }

  function handleChange(e) {
    const selected = e.target.files[0];
    if (selected) onFile(selected);
    e.target.value = '';
  }

  function clearFile(e) {
    e.stopPropagation();
    onFile(null);
  }

  return (
    <div className="dropzone-wrapper">
      {!file ? (
        <div
          className={`dropzone${dragOver ? ' drag-over' : ''}${disabled ? ' disabled' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
          />
          <div className="dropzone-icon">
            <UploadCloud size={24} strokeWidth={1.5} />
          </div>
          <div className="dropzone-title">Arrastre el documento aquí</div>
          <div className="dropzone-sub">
            o <span>haga clic para seleccionar</span> desde su equipo
          </div>
        </div>
      ) : (
        <div className="file-preview">
          <div className="file-preview-ext">{getFileExtension(file.name)}</div>
          <div className="file-preview-info">
            <div className="file-preview-name">{file.name}</div>
            <div className="file-preview-size">{formatFileSize(file.size)}</div>
          </div>
          {!disabled && (
            <button className="file-preview-clear" onClick={clearFile} title="Quitar documento">
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
