export const fmt = (n) => {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  return '₹' + abs.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

export const initialLetter = (name = '?') => (name.trim()[0] || '?').toUpperCase();

export const avatarColor = (name = '') => {
  const colors = ['#1a7a3c', '#c62828', '#558b2f', '#1976d2', '#6a1b9a', '#ef6c00', '#00838f'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
};

export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const daysAgo = (iso) => {
  if (!iso) return 0;
  const d = new Date(iso);
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
};
