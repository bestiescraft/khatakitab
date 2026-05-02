import { fmt } from './format.js';

export function shareOnWhatsApp({ phone = '', message = '' }) {
  // Clean phone -- keep only digits, ensure country code
  let p = (phone || '').replace(/\D/g, '');
  if (p.length === 10) p = '91' + p;
  const url = phone
    ? `https://wa.me/${p}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function buildDueMessage({ partyName, balance, businessName = 'My Shop' }) {
  if (balance > 0) {
    return `Namaste ${partyName} ji,\n\nAapka ${fmt(balance)} udhar baki hai.\nKripya jald bhugtan karein.\n\nDhanyawaad,\n${businessName}\n(via KhataKitab)`;
  }
  if (balance < 0) {
    return `Namaste ${partyName} ji,\n\nHum aapko ${fmt(balance)} dena hai.\nJald bhugtan kar denge.\n\nDhanyawaad,\n${businessName}\n(via KhataKitab)`;
  }
  return `Namaste ${partyName} ji,\n\nAapka khata settle hai. Koi bakaya nahi.\n\nDhanyawaad,\n${businessName}`;
}
