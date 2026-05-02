import Dexie from 'dexie';

export const db = new Dexie('KhataKitabDB');

db.version(1).stores({
  parties: '++id, name, phone, createdAt',
  transactions: '++id, partyId, type, amount, date, createdAt',
  settings: 'key',
});

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// --- Party helpers ---
export async function addParty({ name, phone = '', business = '', address = '', type = 'customer' }) {
  const now = new Date().toISOString();
  const id = await db.parties.add({
    name: name.trim(),
    phone: phone.trim(),
    business: business.trim(),
    address: address.trim(),
    type,
    createdAt: now,
  });
  return id;
}

export async function updateParty(id, changes) {
  return db.parties.update(id, changes);
}

export async function deleteParty(id) {
  await db.transaction('rw', db.parties, db.transactions, async () => {
    await db.transactions.where('partyId').equals(id).delete();
    await db.parties.delete(id);
  });
}

// --- Transaction helpers ---
// type: 'udhar' (you gave / customer owes you / +ve balance)
//       'jama'  (you got / customer paid / -ve balance)
export async function addTransaction({ partyId, type, amount, note = '', date }) {
  const now = new Date().toISOString();
  return db.transactions.add({
    partyId,
    type,
    amount: Number(amount),
    note: note.trim(),
    date: date || now.slice(0, 10),
    createdAt: now,
  });
}

export async function deleteTransaction(id) {
  return db.transactions.delete(id);
}

// --- Balance calculation ---
// Udhar is positive (they owe you). Jama is negative (they paid).
export function computeBalance(txns = []) {
  let bal = 0;
  for (const t of txns) {
    bal += t.type === 'udhar' ? Number(t.amount) : -Number(t.amount);
  }
  return bal;
}

// --- Seed demo data ---
export async function seedIfEmpty() {
  const count = await db.parties.count();
  if (count > 0) return;
  const ramesh = await addParty({ name: 'Ramesh Sharma', phone: '9876543210', business: 'Sharma Kirana Store' });
  const sunita = await addParty({ name: 'Sunita Gupta', phone: '9123456780', business: 'Gupta Wholesale' });
  const ajay = await addParty({ name: 'Ajay Traders', phone: '9988776655', business: 'Ajay & Co.', type: 'supplier' });

  await addTransaction({ partyId: ramesh, type: 'udhar', amount: 2000, note: 'Chawal 5kg' });
  await addTransaction({ partyId: ramesh, type: 'udhar', amount: 1000, note: 'Tel + masala' });
  await addTransaction({ partyId: sunita, type: 'udhar', amount: 6000, note: 'Wholesale stock' });
  await addTransaction({ partyId: ajay, type: 'jama', amount: 7000, note: 'Paid for supplies' });
}

// --- Backup / Restore ---
export async function exportBackup() {
  const parties = await db.parties.toArray();
  const transactions = await db.transactions.toArray();
  return {
    app: 'KhataKitab',
    version: 1,
    exportedAt: new Date().toISOString(),
    parties,
    transactions,
  };
}

export async function importBackup(data) {
  if (!data || data.app !== 'KhataKitab') throw new Error('Invalid backup file');
  await db.transaction('rw', db.parties, db.transactions, async () => {
    await db.parties.clear();
    await db.transactions.clear();
    if (Array.isArray(data.parties)) await db.parties.bulkAdd(data.parties);
    if (Array.isArray(data.transactions)) await db.transactions.bulkAdd(data.transactions);
  });
}

export async function clearAll() {
  await db.transaction('rw', db.parties, db.transactions, async () => {
    await db.parties.clear();
    await db.transactions.clear();
  });
}
