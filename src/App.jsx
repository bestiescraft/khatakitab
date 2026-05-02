import React, { useState } from 'react';
import Home from './pages/Home.jsx';
import Reports from './pages/Reports.jsx';
import Backup from './pages/Backup.jsx';
import Profile from './pages/Profile.jsx';
import Detail from './pages/Detail.jsx';
import BottomNav from './components/BottomNav.jsx';
import { ToastProvider } from './components/Toast.jsx';

export default function App() {
  const [tab, setTab] = useState('home');
  const [activePartyId, setActivePartyId] = useState(null);

  const openParty = (id) => setActivePartyId(id);
  const closeParty = () => setActivePartyId(null);

  return (
    <ToastProvider>
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 relative">
        {activePartyId ? (
          <Detail partyId={activePartyId} onBack={closeParty} />
        ) : (
          <>
            {tab === 'home' && <Home onOpenParty={openParty} />}
            {tab === 'reports' && <Reports />}
            {tab === 'backup' && <Backup />}
            {tab === 'profile' && <Profile />}
            <BottomNav active={tab} onChange={setTab} />
          </>
        )}
      </div>
    </ToastProvider>
  );
}
