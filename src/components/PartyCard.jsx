import React from 'react';
import { fmt, initialLetter, avatarColor } from '../utils/format.js';

export default function PartyCard({ party, balance, txnCount = 0, onClick }) {
  const isPositive = balance > 0;
  const isZero = balance === 0;
  const color = avatarColor(party.name);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-card mb-2.5 text-left active:scale-[0.99] transition-transform"
      data-testid={`party-card-${party.id}`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
        style={{ background: color }}
      >
        {initialLetter(party.name)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[15px] text-gray-900 truncate">{party.name}</h4>
        <span className="text-xs text-gray-500 truncate block">
          {party.business || party.phone || (party.type === 'supplier' ? 'Supplier' : 'Customer')} · {txnCount} {txnCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div className="text-right shrink-0">
        <div className={`font-bold text-base ${isZero ? 'text-gray-500' : isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
          {fmt(balance)}
        </div>
        <div className={`text-[11px] font-semibold ${isZero ? 'text-gray-400' : isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
          {isZero ? '● Settled' : isPositive ? '▲ Will Get' : '▼ Will Give'}
        </div>
      </div>
    </button>
  );
}
