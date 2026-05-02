import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { addParty, updateParty } from '../db/database.js';
import { useToast } from './Toast.jsx';

export default function PartyForm({ open, onClose, existing }) {
  const toast = useToast();
  const [name, setName] = useState(existing?.name || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [business, setBusiness] = useState(existing?.business || '');
  const [address, setAddress] = useState(existing?.address || '');
  const [type, setType] = useState(existing?.type || 'customer');

  React.useEffect(() => {
    if (open) {
      setName(existing?.name || '');
      setPhone(existing?.phone || '');
      setBusiness(existing?.business || '');
      setAddress(existing?.address || '');
      setType(existing?.type || 'customer');
    }
  }, [open, existing]);

  const save = async () => {
    if (!name.trim()) {
      toast('Naam zaruri hai', 'error');
      return;
    }
    if (existing) {
      await updateParty(existing.id, { name, phone, business, address, type });
      toast('Party updated');
    } else {
      await addParty({ name, phone, business, address, type });
      toast('Party saved');
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={existing ? '✏️ Edit Party' : '👤 Add New Party'} testID="party-form">
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setType('customer')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${type === 'customer' ? 'bg-white text-brand-green shadow-soft' : 'text-gray-600'}`}
          data-testid="type-customer"
        >
          👤 Customer
        </button>
        <button
          onClick={() => setType('supplier')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${type === 'supplier' ? 'bg-white text-brand-red shadow-soft' : 'text-gray-600'}`}
          data-testid="type-supplier"
        >
          🏪 Supplier
        </button>
      </div>

      <Field label="Name *">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Full name" maxLength={80} data-testid="input-name" />
      </Field>
      <Field label="Phone Number">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="input" placeholder="+91 98765 43210" maxLength={15} data-testid="input-phone" />
      </Field>
      <Field label="Business Name">
        <input value={business} onChange={(e) => setBusiness(e.target.value)} className="input" placeholder="Shop / company (optional)" maxLength={80} data-testid="input-business" />
      </Field>
      <Field label="Address">
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" placeholder="Area, City (optional)" maxLength={200} data-testid="input-address" />
      </Field>

      <button onClick={save} className="btn-primary" data-testid="party-save-btn">✅ Save Party</button>
      <button onClick={onClose} className="btn-secondary">Cancel</button>

      <style>{`
        .input { width:100%; padding:12px 14px; border:1.5px solid #e1e6ec; border-radius:12px; font-size:15px; outline:none; background:#fff; }
        .input:focus { border-color:#1a7a3c; }
        .btn-primary { width:100%; margin-top:8px; padding:14px; background:#1a7a3c; color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; }
        .btn-primary:active { transform:scale(0.98); }
        .btn-secondary { width:100%; margin-top:8px; padding:14px; background:#f4f6f8; color:#374151; border:none; border-radius:12px; font-size:15px; font-weight:600; cursor:pointer; }
      `}</style>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
