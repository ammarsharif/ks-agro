import React, { useState } from 'react';
import InvoiceForm from './components/InvoiceForm';
import BillForm from './components/BillForm';
import { getActiveTab, saveActiveTab } from './utils/storage';

const TABS = [
  { id: 'statement', label: 'Statement' },
  { id: 'sale', label: 'Sale Bill' },
  { id: 'challan', label: 'Delivery Challan' }
];

function App() {
  const [tab, setTab] = useState(() => {
    const saved = getActiveTab();
    return TABS.some((t) => t.id === saved) ? saved : 'statement';
  });

  const switchTab = (id) => {
    setTab(id);
    saveActiveTab(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100">
      <div className="no-print bg-gray-900 px-2 sm:px-6 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? 'text-white border-blue-400'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'statement' && <InvoiceForm />}
      {tab === 'sale' && <BillForm key="sale" variant="sale" />}
      {tab === 'challan' && <BillForm key="challan" variant="challan" />}
    </div>
  );
}

export default App;
