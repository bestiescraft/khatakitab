# KhataKitab — Digital Udhar Book 📓

A simple, offline-first Progressive Web App (PWA) for shopkeepers to track customer credits (udhar) and payments (jama). **No backend. No signup. 100% free.**

Built with **React + Vite + Tailwind CSS + Dexie.js (IndexedDB)**.

---

## ✨ Features

- 👥 **Customer / Supplier management** — add, edit, delete, search
- 💸 **Udhar & Jama entries** with automatic balance calculation
- 📊 **Dashboard & Reports** — Will Get, Will Give, totals, recent entries
- 💬 **WhatsApp reminders** — "Aapka ₹500 udhar baki hai" in one tap
- 💾 **Backup & Restore** — export / import as JSON
- 📴 **100% offline** — all data stays on your device (IndexedDB)
- 📱 **Installable PWA** — add to home screen on mobile
- 🌱 **Demo data** seeded on first launch

---

## 🚀 Run locally

```bash
cd khatakitab
yarn install          # or npm install
yarn dev              # starts on http://localhost:3000
```

Build for production:

```bash
yarn build            # output in /dist
yarn preview          # preview the build
```

---

## ☁️ Deploy on Vercel (free)

1. Push this project to a GitHub repo.
2. Go to <https://vercel.com> → **New Project** → import the repo.
3. Vercel auto-detects Vite. Keep defaults:
   - **Build Command**: `yarn build` (or `npm run build`)
   - **Output Directory**: `dist`
4. Click **Deploy**. Done. ✅

No env vars needed — everything runs in the browser.

---

## 📱 Install as PWA

### On Android (Chrome)
1. Open the deployed URL in Chrome.
2. Tap the **⋮ menu** → **Install app** (or "Add to Home screen").
3. Launch from your home screen — opens fullscreen, works offline.

### On iPhone (Safari)
1. Open the URL in Safari.
2. Tap the **Share** icon → **Add to Home Screen**.
3. Launch from home screen.

### On Desktop (Chrome/Edge)
1. Open the URL.
2. Click the **install icon** (⊕) in the address bar.

---

## 📁 Project Structure

```
khatakitab/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # manual service worker
│   └── icon.svg
├── src/
│   ├── components/        # Reusable UI (Modal, BottomNav, PartyCard, Toast…)
│   ├── pages/             # Home, Detail, Reports, Backup, Profile
│   ├── db/
│   │   └── database.js    # Dexie schema + CRUD helpers + seed
│   ├── utils/             # format, whatsapp helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🧠 How the data model works

| Table | Fields |
|------|--------|
| `parties` | id, name, phone, business, address, type (customer/supplier), createdAt |
| `transactions` | id, partyId, type (`udhar`/`jama`), amount, note, date, createdAt |
| `settings` | key ("business"), name, phone, type, address |

**Balance rule**: positive balance = **Will Get** (customer owes you). Negative = **Will Give** (you owe them).

---

## 💡 Tips

- Use the **Backup** tab weekly to export a `.json` file. IndexedDB can be cleared by the browser.
- The WhatsApp reminder opens `wa.me` — works on both mobile and desktop.
- First launch seeds 3 demo parties so the dashboard isn't empty. Delete them from the Profile → Clear All Data.

---

## 📜 License

MIT — free to use, modify and sell. Built with ❤️ for small shopkeepers.
