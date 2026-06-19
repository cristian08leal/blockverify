import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getHealth } from '../api';
import './Header.css';

export default function Header() {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'connected' | 'disconnected'

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await getHealth();
        setHealth(data);
        setStatus(data.blockchain_connected ? 'connected' : 'disconnected');
      } catch {
        setStatus('disconnected');
      }
    }
    checkHealth();
  }, []);

  const statusLabels = {
    loading:      'Verificando',
    connected:    'Conectado',
    disconnected: 'Sin conexión',
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="header-logo">
          <div className="header-logo-icon">
            <ShieldCheck size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="header-logo-name">BlockVerify</div>
            <div className="header-logo-tag">Registro Notarial Digital</div>
          </div>
        </div>

        {/* Blockchain status indicator */}
        <div className="header-status">
          <div className={`header-status-dot ${status}`} />
          <span className={`header-status-text ${status}`}>
            {statusLabels[status]}
          </span>
          {health?.contract_address && (
            <span className="header-status-address" title={health.contract_address}>
              {health.contract_address.slice(0, 10)}…
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
