import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, computeBalance } from '../db/database.js';
import { fmt, formatDate } from '../utils/format.js';

export default function Reports() {
  const parties = useLiveQuery(() => db.parties.toArray(), []) || [];
  const txns = useLiveQuery(() => db.transactions.toArray(), []) || [];

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTxns = txns.filter((t) => t.date === today);
    const totalGet = parties.reduce((s, p) => {
      const b = computeBalance(txns.filter((t) => t.partyId === p.id));
      return s + (b > 0 ? b : 0);
    }, 0);
    const totalGive = parties.reduce((s, p) => {
      const b = computeBalance(txns.filter((t) => t.partyId === p.id));
      return s + (b < 0 ? Math.abs(b) : 0);
    }, 0);
    const totalUdhar = txns.filter((t) => t.type === 'udhar').reduce((s, t) => s + Number(t.amount), 0);
    const totalJama = txns.filter((t) => t.type === 'jama').reduce((s, t) => s + Number(t.amount), 0);
    return {
      parties: parties.length,
      txns: txns.length,
      todayCount: todayTxns.length,
      totalGet,
      totalGive,
      totalUdhar,
      totalJama,
      netProfit: totalJama - totalUdhar,
    };
  }, [parties, txns]);

  const recent = useMemo(
    () => [...txns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 8),
    [txns]
  );
  const pMap = Object.fromEntries(parties.map((p) => [p.id, p.name]));

  return (
    <div className="pb-28">
      <header className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">📊</div>
          <div>
            <h1 className="text-lg font-bold">Reports</h1>
            <p className="text-xs text-white/80">Business insights</p>
          </div>
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-card grid grid-cols-2 gap-3">
          <StatCard label="Total Parties" value={stats.parties} />
          <StatCard label="Total Entries" value={stats.txns} />
          <StatCard label="Today's Entries" value={stats.todayCount} color="text-brand-blue" />
          <StatCard label="Net Cashflow" value={fmt(stats.netProfit)} color={stats.netProfit >= 0 ? 'text-brand-green' : 'text-brand-red'} small />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="text-xs font-semibold text-gray-500">📈 Will Get</div>
            <div className="text-lg font-bold text-brand-green mt-1">{fmt(stats.totalGet)}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="text-xs font-semibold text-gray-500">📉 Will Give</div>
            <div className="text-lg font-bold text-brand-red mt-1">{fmt(stats.totalGive)}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-sm mb-3">Totals</h3>
          <Row label="Total Udhar diya (Paid out)" value={fmt(stats.totalUdhar)} color="text-brand-red" />
          <Row label="Total Jama mila (Received)" value={fmt(stats.totalJama)} color="text-brand-green" />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-sm mb-3">Recent Entries</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No entries yet</p>
          ) : (
            recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-semibold">{pMap[t.partyId] || 'Unknown'}</div>
                  <div className="text-[11px] text-gray-500">{t.note || (t.type === 'udhar' ? 'Udhar' : 'Jama')} · {formatDate(t.date)}</div>
                </div>
                <div className={`font-bold text-sm ${t.type === 'udhar' ? 'text-brand-red' : 'text-brand-green'}`}>
                  {t.type === 'udhar' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900', small = false }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 font-semibold">{label}</div>
      <div className={`font-bold mt-0.5 ${color} ${small ? 'text-sm' : 'text-xl'}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
    </div>
  );
}
