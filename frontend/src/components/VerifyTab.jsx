import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import DropZone from './DropZone';
import CopyableHash from './CopyableHash';
import { verifyDocument } from '../api';
import { formatTimestamp } from '../utils';
import './VerifyTab.css';

function VerdictCard({ data }) {
  const { status, documentHash, fileName, owner, timestamp, revoked } = data;

  if (status === 'no_registrado') {
    return (
      <div className="verdict card">
        <div className="verdict-banner not-found">
          <XCircle className="verdict-icon" size={32} strokeWidth={2} />
          <div>
            <div className="verdict-title">Documento No Registrado</div>
            <div className="verdict-subtitle">
              Este archivo no existe en la blockchain. Puede haber sido alterado o nunca fue registrado formalmente.
            </div>
          </div>
        </div>
        <div className="verdict-details">
          <div className="verdict-detail-row">
            <span className="verdict-detail-label">Hash calculado</span>
            <span className="verdict-detail-value">
              <CopyableHash value={documentHash} start={14} end={10} />
            </span>
          </div>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 12, fontWeight: 700 }}>
              Posibles motivos:
            </p>
            <ul className="verdict-not-found-info">
              <li>El archivo fue modificado (incluso un solo byte altera el hash).</li>
              <li>El documento nunca fue ingresado en este sistema notarial.</li>
              <li>Se está verificando un borrador en lugar de la versión final.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const isRevoked = status === 'revocado' || revoked;

  return (
    <div className="verdict card">
      <div className={`verdict-banner ${isRevoked ? 'revoked' : 'authentic'}`}>
        {isRevoked ? (
          <AlertTriangle className="verdict-icon" size={32} strokeWidth={2} />
        ) : (
          <CheckCircle className="verdict-icon" size={32} strokeWidth={2} />
        )}
        <div>
          <div className="verdict-title">
            {isRevoked ? 'Documento Revocado' : 'Documento Auténtico'}
          </div>
          <div className="verdict-subtitle">
            {isRevoked
              ? 'Este documento figura en el registro pero ha sido revocado oficialmente por su emisor.'
              : 'La integridad del archivo ha sido verificada con éxito. El documento es válido y está activo.'}
          </div>
        </div>
      </div>

      <div className="verdict-details">
        <div className="verdict-detail-row">
          <span className="verdict-detail-label">Estado de Validez</span>
          <span className="verdict-detail-value">
            <span className={`badge ${isRevoked ? 'badge-warning' : 'badge-success'}`}>
              {isRevoked ? 'Revocado' : 'Activo y Válido'}
            </span>
          </span>
        </div>
        <div className="verdict-detail-row">
          <span className="verdict-detail-label">Nombre del Archivo</span>
          <span className="verdict-detail-value" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {fileName}
          </span>
        </div>
        <div className="verdict-detail-row">
          <span className="verdict-detail-label">Huella (Hash)</span>
          <span className="verdict-detail-value">
            <CopyableHash value={documentHash} start={12} end={10} />
          </span>
        </div>
        <div className="verdict-detail-row">
          <span className="verdict-detail-label">Entidad Emisora</span>
          <span className="verdict-detail-value">
            <CopyableHash value={owner} start={10} end={8} />
          </span>
        </div>
        <div className="verdict-detail-row">
          <span className="verdict-detail-label">Fecha de Emisión</span>
          <span className="verdict-detail-value" style={{ color: 'var(--color-text-primary)' }}>
            {formatTimestamp(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleVerify() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await verifyDocument(file);
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Error desconocido al verificar el documento.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setFile(null);
  }

  return (
    <div className="verify-tab">
      <div className="verify-tab-header">
        <h2>Verificación de Autenticidad</h2>
        <p>Sube un archivo para comprobar contra el registro blockchain si su contenido se mantiene intacto y su estado es válido.</p>
      </div>

      {!result && (
        <>
          <DropZone file={file} onFile={setFile} disabled={loading} />

          {error && (
            <div className="verify-error">
              <AlertTriangle className="verify-error-icon" size={20} strokeWidth={2} />
              <div>
                <div className="verify-error-title">Error en la consulta</div>
                <div className="verify-error-msg">{error}</div>
              </div>
            </div>
          )}

          <div>
            <button
              className="btn btn-primary"
              disabled={!file || loading}
              onClick={handleVerify}
              id="btn-verify"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Consultando registro…
                </>
              ) : (
                <>
                  <Search size={18} strokeWidth={2} />
                  Verificar Documento
                </>
              )}
            </button>
          </div>
        </>
      )}

      {result && (
        <>
          <VerdictCard data={result} />
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={reset} id="btn-verify-another">
              <ArrowLeft size={16} strokeWidth={2} />
              Realizar nueva consulta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
