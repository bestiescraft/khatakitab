import React from 'react';

const tabs = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'reports', label: 'Reports', icon: '📊' },
  { key: 'backup', label: 'Backup', icon: '☁️' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-stretch z-30 pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="bottom-nav"
    >
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition ${
              on ? 'text-brand-green' : 'text-gray-500'
            }`}
            data-testid={`nav-${t.key}`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className={`text-[11px] ${on ? 'font-bold' : 'font-medium'}`}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
