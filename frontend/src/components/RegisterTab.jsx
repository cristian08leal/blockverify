import { useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldPlus, Plus } from 'lucide-react';
import DropZone from './DropZone';
import CopyableHash from './CopyableHash';
import { registerDocument } from '../api';
import './RegisterTab.css';

export default function RegisterTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);  // success data
  const [error, setError] = useState(null);

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await registerDocument(file);
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Error desconocido al registrar el documento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-tab">
      <div className="register-tab-header">
        <h2>Registro de Nuevo Documento</h2>
        <p>Sube un archivo para calcular su huella digital criptográfica (SHA-256) y registrarla permanentemente en la blockchain como prueba de existencia y propiedad.</p>
      </div>

      {/* Upload zone (hide while showing result) */}
      {!result && (
        <>
          <DropZone file={file} onFile={setFile} disabled={loading} />

          {/* Error message */}
          {error && (
            <div className="register-error">
              <AlertCircle className="register-error-icon" size={20} strokeWidth={2} />
              <div className="register-error-content">
                <div className="register-error-title">No se pudo registrar</div>
                <div className="register-error-msg">{error}</div>
              </div>
            </div>
          )}

          <div className="register-actions">
            <button
              className="btn btn-primary"
              disabled={!file || loading}
              onClick={handleSubmit}
              id="btn-register"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Procesando transacción…
                </>
              ) : (
                <>
                  <ShieldPlus size={18} strokeWidth={2} />
                  Emitir Registro en Blockchain
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Success result */}
      {result && (
        <div className="card register-result">
          <div className="register-result-header">
            <div className="register-result-icon">
              <CheckCircle2 size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="register-result-title">Certificado de Registro Emitido</div>
              <div className="register-result-subtitle">La transacción fue minada y confirmada en la red blockchain.</div>
            </div>
          </div>

          <div className="result-grid">
            <div className="result-row">
              <span className="result-label">Documento</span>
              <span className="result-value">
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  {result.fileName}
                </span>
              </span>
            </div>
            <div className="result-row">
              <span className="result-label">Huella (Hash)</span>
              <span className="result-value">
                <CopyableHash value={result.documentHash} start={12} end={10} />
              </span>
            </div>
            <div className="result-row">
              <span className="result-label">Transacción</span>
              <span className="result-value">
                <CopyableHash value={result.transactionHash} start={12} end={10} />
              </span>
            </div>
            <div className="result-row">
              <span className="result-label">Bloque Confirmado</span>
              <span className="result-value">
                <span className="block-number">#{result.blockNumber}</span>
              </span>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <button className="btn btn-secondary" onClick={reset} id="btn-register-another">
              <Plus size={16} strokeWidth={2} />
              Registrar otro documento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
