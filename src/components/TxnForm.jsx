import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { addTransaction } from '../db/database.js';
import { useToast } from './Toast.jsx';

const CATEGORIES = ['Sales', 'Purchase', 'Payment Received', 'Payment Made', 'Advance', 'Refund', 'Other'];

export default function TxnForm({ open, onClose, partyId, type }) {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory('');
    }
  }, [open]);

  const save = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast('Sahi amount daalein', 'error');
      return;
    }
    const finalNote = category ? (note ? `${category} · ${note}` : category) : note;
    await addTransaction({ partyId, type, amount: amt, note: finalNote, date });
    toast(type === 'udhar' ? 'Udhar added' : 'Jama added');
    onClose();
  };

  const isUdhar = type === 'udhar';

  return (
    <Modal open={open} onClose={onClose} title={isUdhar ? '💸 Udhar (You Gave)' : '💰 Jama (You Got)'} testID="txn-form">
      <div className={`rounded-xl p-4 mb-4 text-center ${isUdhar ? 'bg-red-50' : 'bg-green-50'}`}>
        <div className={`text-xs font-semibold ${isUdhar ? 'text-brand-red' : 'text-brand-green'}`}>
          {isUdhar ? 'Party ko udhar diya (they owe you)' : 'Party se paisa mila (they paid)'}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Amount *</label>
        <div className="flex items-center border-[1.5px] border-gray-200 rounded-xl focus-within:border-brand-green overflow-hidden">
          <span className="px-3 text-gray-500 font-semibold">₹</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="0"
            className="flex-1 py-3 pr-3 text-lg font-bold outline-none"
            autoFocus
            data-testid="input-amount"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full py-3 px-3.5 border-[1.5px] border-gray-200 rounded-xl outline-none" />
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full py-3 px-3 border-[1.5px] border-gray-200 rounded-xl outline-none bg-white">
          <option value="">— Select —</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Note</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full py-3 px-3.5 border-[1.5px] border-gray-200 rounded-xl outline-none" placeholder="Item details, invoice #" maxLength={200} data-testid="input-note" />
      </div>

      <button
        onClick={save}
        className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white text-[15px] ${isUdhar ? 'bg-brand-red' : 'bg-brand-green'}`}
        data-testid="txn-save-btn"
      >
        ✅ Save Entry
      </button>
      <button onClick={onClose} className="w-full py-3.5 mt-2 rounded-xl font-semibold bg-gray-100 text-gray-700">Cancel</button>
    </Modal>
  );
}
