import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, computeBalance } from '../db/database.js';
import { fmt } from '../utils/format.js';
import PartyCard from '../components/PartyCard.jsx';
import PartyForm from '../components/PartyForm.jsx';

export default function Home({ onOpenParty }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all|customer|supplier|get|give|settled
  const [showAdd, setShowAdd] = useState(false);

  const parties = useLiveQuery(() => db.parties.orderBy('name').toArray(), []) || [];
  const allTxns = useLiveQuery(() => db.transactions.toArray(), []) || [];

  const enriched = useMemo(() => {
    const byParty = {};
    for (const t of allTxns) {
      (byParty[t.partyId] = byParty[t.partyId] || []).push(t);
    }
    return parties.map((p) => {
      const txns = byParty[p.id] || [];
      return { ...p, txns, balance: computeBalance(txns), txnCount: txns.length };
    });
  }, [parties, allTxns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.phone} ${p.business || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === 'customer' && p.type !== 'customer') return false;
      if (filter === 'supplier' && p.type !== 'supplier') return false;
      if (filter === 'get' && p.balance <= 0) return false;
      if (filter === 'give' && p.balance >= 0) return false;
      if (filter === 'settled' && p.balance !== 0) return false;
      return true;
    });
  }, [enriched, search, filter]);

  const totalGet = enriched.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const totalGive = enriched.filter((p) => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
  const getCount = enriched.filter((p) => p.balance > 0).length;
  const giveCount = enriched.filter((p) => p.balance < 0).length;

  const chips = [
    ['all', 'All'],
    ['customer', 'Customers'],
    ['supplier', 'Suppliers'],
    ['get', 'Will Get'],
    ['give', 'Will Give'],
    ['settled', 'Settled'],
  ];

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="bg-brand-green text-white px-4 py-4 sticky top-0 z-20 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">KK</div>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">KhataKitab</h1>
            <p className="text-xs text-white/80">Digital Udhar Book</p>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-2xl p-3.5 shadow-card">
            <div className="text-[11px] text-gray-500 font-semibold">📈 Will Get (Udhar)</div>
            <div className="text-xl font-bold text-brand-green mt-0.5" data-testid="total-get">{fmt(totalGet)}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{getCount} {getCount === 1 ? 'party' : 'parties'}</div>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-card">
            <div className="text-[11px] text-gray-500 font-semibold">📉 Will Give (Jama)</div>
            <div className="text-xl font-bold text-brand-red mt-0.5" data-testid="total-give">{fmt(totalGive)}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{giveCount} {giveCount === 1 ? 'party' : 'parties'}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="bg-white rounded-xl flex items-center px-3.5 py-2.5 shadow-soft">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, business…"
            className="flex-1 outline-none text-sm bg-transparent"
            maxLength={100}
            data-testid="search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 ml-2" aria-label="Clear">✕</button>
          )}
        </div>
      </div>

      {/* Chips */}
      <div className="px-3 pt-3 flex gap-2 overflow-x-auto scroll-hide">
        {chips.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
              filter === key ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-700 border-gray-200'
            }`}
            data-testid={`chip-${key}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-3 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-800">Parties ({filtered.length})</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-card mt-2">
            <div className="text-5xl mb-3">📓</div>
            <p className="text-gray-700 font-semibold">No parties found</p>
            <p className="text-xs text-gray-500 mt-1">Tap + to add your first party</p>
          </div>
        ) : (
          filtered.map((p) => (
            <PartyCard key={p.id} party={p} balance={p.balance} txnCount={p.txnCount} onClick={() => onOpenParty(p.id)} />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full bg-brand-green text-white text-3xl shadow-xl flex items-center justify-center active:scale-95 transition z-20"
        aria-label="Add party"
        data-testid="fab-add-party"
      >
        +
      </button>

      <PartyForm open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
