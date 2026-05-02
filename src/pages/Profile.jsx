import React, { useState, useEffect } from 'react';
import { db } from '../db/database.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useToast } from '../components/Toast.jsx';

export default function Profile() {
  const toast = useToast();
  const biz = useLiveQuery(() => db.settings.get('business'), []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('General Store');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (biz) {
      setName(biz.name || '');
      setPhone(biz.phone || '');
      setType(biz.type || 'General Store');
      setAddress(biz.address || '');
    }
  }, [biz]);

  const save = async () => {
    if (!name.trim()) {
      toast('Business name zaruri hai', 'error');
      return;
    }
    await db.settings.put({ key: 'business', name, phone, type, address });
    toast('Profile saved');
  };

  const types = ['General Store', 'Wholesale', 'Retail', 'Manufacturing', 'Services', 'Restaurant', 'Other'];

  return (
    <div className="pb-28">
      <header className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">👤</div>
          <div>
            <h1 className="text-lg font-bold">Profile</h1>
            <p className="text-xs text-white/80">Business settings</p>
          </div>
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-brand-green text-white flex items-center justify-center text-2xl font-bold">
              {(name || 'M')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{name || 'My Business'}</h3>
              <p className="text-xs text-gray-500 truncate">{phone || 'Add phone below'}</p>
              <p className="text-xs text-gray-500">{type}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-sm mb-3">🏪 Business Info</h3>

          <Field label="Business Name *">
            <input value={name} onChange={(e) => setName(e.target.value)} className="inp" placeholder="My Shop" maxLength={80} data-testid="biz-name" />
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="inp" placeholder="+91 98765 43210" maxLength={15} data-testid="biz-phone" />
          </Field>
          <Field label="Business Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="inp bg-white">
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="inp" placeholder="Shop address" maxLength={200} />
          </Field>

          <button onClick={save} className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-sm mt-2" data-testid="save-profile">
            ✅ Save Profile
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 py-4">KhataKitab v1.0 · All data stored locally</p>
      </div>

      <style>{`.inp { width:100%; padding:12px 14px; border:1.5px solid #e1e6ec; border-radius:12px; font-size:14px; outline:none; background:#fff; } .inp:focus { border-color:#1a7a3c; }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
