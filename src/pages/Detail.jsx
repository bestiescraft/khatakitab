import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, computeBalance, deleteParty, deleteTransaction } from '../db/database.js';
import { fmt, formatDate, initialLetter, avatarColor, daysAgo } from '../utils/format.js';
import TxnForm from '../components/TxnForm.jsx';
import PartyForm from '../components/PartyForm.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { shareOnWhatsApp, buildDueMessage } from '../utils/whatsapp.js';

export default function Detail({ partyId, onBack }) {
  const toast = useToast();
  const [txnType, setTxnType] = useState(null); // 'udhar'|'jama'|null
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const party = useLiveQuery(() => db.parties.get(partyId), [partyId]);
  const txns = useLiveQuery(
    () => db.transactions.where('partyId').equals(partyId).toArray().then((arr) => arr.sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))),
    [partyId]
  ) || [];

  const balance = computeBalance(txns);
  const gave = txns.filter((t) => t.type === 'udhar').reduce((s, t) => s + Number(t.amount), 0);
  const got = txns.filter((t) => t.type === 'jama').reduce((s, t) => s + Number(t.amount), 0);

  const filteredTxns = useMemo(() => {
    if (filter === 'udhar') return txns.filter((t) => t.type === 'udhar');
    if (filter === 'jama') return txns.filter((t) => t.type === 'jama');
    return txns;
  }, [txns, filter]);

  const lastDate = txns[0]?.date || null;
  const sinceAdded = party?.createdAt ? daysAgo(party.createdAt) : 0;

  const handleDelete = async () => {
    if (!confirm(`Delete ${party?.name} and all their entries? This cannot be undone.`)) return;
    await deleteParty(partyId);
    toast('Party deleted');
    onBack();
  };

  const handleShare = () => {
    const msg = buildDueMessage({ partyName: party.name, balance });
    shareOnWhatsApp({ phone: party.phone, message: msg });
    setMenuOpen(false);
  };

  const handleCall = () => {
    if (party?.phone) window.location.href = `tel:${party.phone}`;
  };

  if (!party) {
    return (
      <div className="p-8 text-center text-gray-500">
        <button onClick={onBack} className="text-brand-green font-semibold">← Back</button>
        <p className="mt-4">Party not found</p>
      </div>
    );
  }

  const color = avatarColor(party.name);

  return (
    <div className="pb-28 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 sticky top-0 z-20 shadow-soft flex items-center gap-3">
        <button onClick={onBack} className="text-2xl text-gray-700 px-1" data-testid="detail-back">←</button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: color }}>
          {initialLetter(party.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate">{party.name}</h2>
          <p className="text-xs text-gray-500 truncate">{party.phone || party.business || 'No contact'}</p>
        </div>
        {party.phone && (
          <button onClick={handleCall} className="text-xl px-2" aria-label="Call" data-testid="detail-call">📞</button>
        )}
        <button onClick={() => setMenuOpen(true)} className="text-xl px-2" aria-label="More" data-testid="detail-menu">⋮</button>
      </header>

      {/* Balance banner */}
      <div className={`mx-3 mt-3 rounded-2xl p-4 text-white ${balance > 0 ? 'bg-brand-green' : balance < 0 ? 'bg-brand-red' : 'bg-gray-700'}`}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] opacity-80">You Got</div>
            <div className="font-bold text-sm mt-0.5">{fmt(got)}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-80">You Gave</div>
            <div className="font-bold text-sm mt-0.5">{fmt(gave)}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-80">{balance > 0 ? 'Will Get' : balance < 0 ? 'Will Give' : 'Net'}</div>
            <div className="font-bold text-sm mt-0.5" data-testid="detail-balance">{fmt(balance)}</div>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-3 grid grid-cols-3 gap-2">
        <Stat v={txns.length} k="Entries" />
        <Stat v={lastDate ? formatDate(lastDate) : '—'} k="Last Entry" small />
        <Stat v={`${sinceAdded}d`} k="Since Added" />
      </div>

      {/* Actions */}
      <div className="px-3 mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setTxnType('udhar')}
          className="bg-brand-red text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition"
          data-testid="btn-udhar"
        >
          💸 Udhar Diya
        </button>
        <button
          onClick={() => setTxnType('jama')}
          className="bg-brand-green text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition"
          data-testid="btn-jama"
        >
          💰 Jama Mila
        </button>
      </div>

      {/* WhatsApp Share CTA */}
      {balance !== 0 && (
        <div className="px-3 mt-3">
          <button onClick={handleShare} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm" data-testid="whatsapp-share">
            💬 Send WhatsApp Reminder
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="px-3 mt-5 flex gap-2">
        {[['all', 'All'], ['jama', 'Received'], ['udhar', 'Paid Out']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${filter === k ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Txn list */}
      <div className="px-3 mt-3">
        {filteredTxns.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-card">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600 text-sm">Koi entry nahi hai</p>
          </div>
        ) : (
          filteredTxns.map((t) => (
            <div key={t.id} className="bg-white rounded-xl p-3 mb-2 shadow-soft flex items-center gap-3" data-testid={`txn-row-${t.id}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${t.type === 'udhar' ? 'bg-brand-red' : 'bg-brand-green'}`}>
                {t.type === 'udhar' ? '▲' : '▼'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.note || (t.type === 'udhar' ? 'Udhar' : 'Jama')}</div>
                <div className="text-[11px] text-gray-500">{formatDate(t.date)}</div>
              </div>
              <div className={`font-bold text-sm ${t.type === 'udhar' ? 'text-brand-red' : 'text-brand-green'}`}>
                {t.type === 'udhar' ? '+' : '-'}{fmt(t.amount)}
              </div>
              <button
                onClick={async () => {
                  if (confirm('Delete this entry?')) {
                    await deleteTransaction(t.id);
                    toast('Entry deleted');
                  }
                }}
                className="text-gray-400 hover:text-brand-red px-1 text-base"
                aria-label="Delete"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      <TxnForm open={!!txnType} onClose={() => setTxnType(null)} partyId={partyId} type={txnType} />
      <PartyForm open={editOpen} onClose={() => setEditOpen(false)} existing={party} />

      {/* Context Menu */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} testID="party-menu">
        <div className="space-y-1">
          {party.phone && (
            <MenuItem icon="📞" label="Call" onClick={() => { handleCall(); setMenuOpen(false); }} />
          )}
          <MenuItem icon="💬" label="Share on WhatsApp" onClick={handleShare} />
          <MenuItem icon="✏️" label="Edit Party" onClick={() => { setEditOpen(true); setMenuOpen(false); }} />
          <MenuItem icon="🗑️" label="Delete Party" danger onClick={() => { setMenuOpen(false); handleDelete(); }} />
        </div>
      </Modal>
    </div>
  );
}

function Stat({ v, k, small }) {
  return (
    <div className="bg-white rounded-xl p-2.5 text-center shadow-soft">
      <div className={`font-bold text-gray-900 ${small ? 'text-[11px]' : 'text-sm'}`}>{v}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{k}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 text-left ${danger ? 'text-brand-red' : 'text-gray-800'}`}
      data-testid={`menu-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}
