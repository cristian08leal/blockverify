import { useState } from 'react';
import { ClipboardList, Search, Archive } from 'lucide-react';
import Header from './components/Header';
import RegisterTab from './components/RegisterTab';
import VerifyTab from './components/VerifyTab';
import HistoryTab from './components/HistoryTab';
import './App.css';

const TABS = [
  { id: 'register', icon: <ClipboardList size={18} strokeWidth={2} />, label: 'Registrar' },
  { id: 'verify',   icon: <Search size={18} strokeWidth={2} />, label: 'Verificar' },
  { id: 'history',  icon: <Archive size={18} strokeWidth={2} />, label: 'Historial' },
];

function App() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="app-bg">
      <Header />

      <main className="app-main">
        {/* Tab navigation */}
        <nav className="tab-nav" role="tablist" aria-label="Secciones de BlockVerify">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              id={`tab-${tab.id}`}
            >
              <span className="tab-btn-icon">{tab.icon}</span>
              <span className="tab-btn-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab panels */}
        <div className="tab-panel" role="tabpanel">
          {activeTab === 'register' && <RegisterTab />}
          {activeTab === 'verify'   && <VerifyTab />}
          {activeTab === 'history'  && <HistoryTab />}
        </div>
      </main>
    </div>
  );
}

export default App;
