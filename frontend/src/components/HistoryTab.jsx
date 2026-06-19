import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, FileWarning, Ban, Inbox, AlertCircle } from 'lucide-react';
import CopyableHash from './CopyableHash';
import { getHistory, revokeDocument } from '../api';
import { formatTimestamp } from '../utils';
import './HistoryTab.css';

// Skeleton rows for loading state
function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i} className="history-skeleton-row">
      <td><div className="skeleton" style={{ width: '60%' }} /></td>
      <td><div className="skeleton" style={{ width: '80%' }} /></td>
      <td><div className="skeleton" style={{ width: '70%' }} /></td>
      <td><div className="skeleton" style={{ width: '50%' }} /></td>
      <td><div className="skeleton" style={{ width: '40%' }} /></td>
      <td><div className="skeleton" style={{ width: '30%' }} /></td>
    </tr>
  ));
}

// Revoke confirmation modal
function RevokeModal({ doc, onConfirm, onCancel, loading }) {
  return (
    <div className="revoke-modal-overlay" onClick={onCancel}>
      <div className="revoke-modal" onClick={e => e.stopPropagation()}>
        <div className="revoke-modal-icon">
          <Ban size={28} strokeWidth={2} />
        </div>
        <div className="revoke-modal-title">Anulación de Documento</div>
        <p className="revoke-modal-desc">
          Está a punto de revocar la validez de <strong>{doc.fileName}</strong>.
          Esta acción quedará registrada permanentemente en la blockchain y no podrá revertirse.
        </p>
        <div className="revoke-modal-hash">{doc.documentHash}</div>
        <div className="revoke-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={onConfirm}
            disabled={loading}
            id="btn-confirm-revoke"
          >
            {loading ? <><span className="spinner" /> Procesando…</> : 'Confirmar Anulación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryTab() {
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setDocs(data.documents || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'No se pudo obtener el historial.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    setRevokeError(null);
    try {
      await revokeDocument('0x' + revokeTarget.documentHash.replace(/^0x/, ''));
      setRevokeTarget(null);
      await fetchHistory();
    } catch (err) {
      setRevokeError(err.message || 'Error al revocar el documento.');
      setRevokeLoading(false);
    }
  }

  return (
    <div className="history-tab">
      {/* Modal */}
      {revokeTarget && (
        <RevokeModal
          doc={revokeTarget}
          onConfirm={handleRevoke}
          onCancel={() => { setRevokeTarget(null); setRevokeError(null); setRevokeLoading(false); }}
          loading={revokeLoading}
        />
      )}

      {/* Header */}
      <div className="history-tab-header">
        <div className="history-tab-header-text">
          <h2>Registro Histórico</h2>
          <p>Libro mayor de todos los documentos registrados en la blockchain, ordenados cronológicamente.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {!loading && (
            <span className="history-count-badge">
              {total} documento{total !== 1 ? 's' : ''}
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={fetchHistory}
            disabled={loading}
            id="btn-refresh-history"
            style={{ padding: '8px 16px' }}
          >
            <RefreshCw size={16} strokeWidth={2} className={loading ? 'icon-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="history-error">
          <AlertCircle className="history-error-icon" size={20} strokeWidth={2} />
          <div>
            <div className="history-error-title">Error de lectura</div>
            <div className="history-error-msg">{error}</div>
          </div>
        </div>
      )}

      {/* Revoke error */}
      {revokeError && (
        <div className="history-error">
          <FileWarning className="history-error-icon" size={20} strokeWidth={2} />
          <div>
            <div className="history-error-title">Fallo en la anulación</div>
            <div className="history-error-msg">{revokeError}</div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <div className="history-empty">
          <div className="history-empty-icon">
            <Inbox size={32} strokeWidth={1.5} />
          </div>
          <div className="history-empty-title">El registro está vacío</div>
          <div className="history-empty-sub">
            Aún no se han emitido registros notariales en esta instancia de la blockchain.
          </div>
        </div>
      )}

      {/* Table */}
      {(loading || total > 0) && !error && (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Huella (Hash)</th>
                <th>Emisor</th>
                <th>Fecha de Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                docs.map((doc, idx) => (
                  <tr key={doc.documentHash || idx}>
                    <td>
                      <div className="history-file-name" title={doc.fileName}>
                        {doc.fileName}
                      </div>
                    </td>
                    <td>
                      <CopyableHash value={doc.documentHash} start={8} end={6} />
                    </td>
                    <td>
                      <CopyableHash value={doc.owner} start={8} end={6} />
                    </td>
                    <td>
                      <span className="history-date">{formatTimestamp(doc.timestamp)}</span>
                    </td>
                    <td>
                      {doc.revoked
                        ? <span className="badge badge-warning">Revocado</span>
                        : <span className="badge badge-success">Activo</span>
                      }
                    </td>
                    <td>
                      {!doc.revoked && (
                        <button
                          className="btn-revoke"
                          onClick={() => { setRevokeError(null); setRevokeTarget(doc); }}
                          id={`btn-revoke-${idx}`}
                        >
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
