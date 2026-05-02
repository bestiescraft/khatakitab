import React, { useRef, useState, useEffect } from 'react';
import { exportBackup, importBackup, clearAll } from '../db/database.js';
import { useToast } from '../components/Toast.jsx';
import { initGoogleClient, signIn, uploadToDrive, downloadFromDrive, checkSignInStatus } from '../utils/gdrive.js';

export default function Backup() {
  const toast = useToast();
  const fileRef = useRef(null);

  const [isDriveReady, setIsDriveReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      initGoogleClient(clientId, () => {
        setIsSignedIn(true);
      })
        .then(() => {
          setIsDriveReady(true);
          setIsSignedIn(checkSignInStatus());
        })
        .catch((e) => {
          console.error('Failed to init Google Drive', e);
        });
    }
  }, []);

  const handleSignIn = async () => {
    try {
      await signIn();
      setIsSignedIn(true);
      toast('Signed in to Google');
    } catch (e) {
      toast('Failed to sign in', 'error');
    }
  };

  const handleDriveBackup = async () => {
    try {
      setIsSyncing(true);
      const data = await exportBackup();
      await uploadToDrive(data);
      toast('Successfully backed up to Google Drive');
    } catch (e) {
      console.error(e);
      toast('Failed to backup to Drive', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDriveRestore = async () => {
    if (!confirm('This will replace all current data with the backup from Google Drive. Continue?')) return;
    try {
      setIsSyncing(true);
      const data = await downloadFromDrive();
      await importBackup(data);
      toast('Data restored from Google Drive');
    } catch (e) {
      console.error(e);
      toast(e.message || 'Failed to restore from Drive', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khatakitab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup exported');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!confirm('This will replace all current data with the backup. Continue?')) return;
      await importBackup(data);
      toast('Data restored');
    } catch (err) {
      toast('Invalid backup file', 'error');
    }
    e.target.value = '';
  };

  const handleClear = async () => {
    if (!confirm('Permanently delete ALL parties and entries? This cannot be undone.')) return;
    await clearAll();
    toast('All data cleared');
  };

  return (
    <div className="pb-28">
      <header className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">☁️</div>
          <div>
            <h1 className="text-lg font-bold">Backup &amp; Restore</h1>
            <p className="text-xs text-white/80">Protect your data</p>
          </div>
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">
        {/* Google Drive Backup Section */}
        <div className="bg-white rounded-2xl p-4 shadow-card border-2 border-brand-green/20">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
            <span className="text-lg">☁️</span> Google Drive Sync
          </h3>
          <p className="text-xs text-gray-500 mb-3">Securely backup your data to your personal Google Drive and restore it on any device.</p>

          {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-200">
              Google Drive integration is not configured. Please add your Client ID to .env
            </div>
          ) : !isDriveReady ? (
            <div className="text-center py-2 text-xs text-gray-400 animate-pulse">Loading Google Services...</div>
          ) : !isSignedIn ? (
            <button onClick={handleSignIn} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2" data-testid="drive-signin-btn">
              <span>👤</span> Sign in with Google
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDriveBackup}
                disabled={isSyncing}
                className={`w-full bg-brand-green text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 ${isSyncing ? 'opacity-70' : 'active:scale-95 transition'}`}
              >
                {isSyncing ? 'Syncing...' : '↑ Backup'}
              </button>
              <button
                onClick={handleDriveRestore}
                disabled={isSyncing}
                className={`w-full bg-brand-blueLight text-brand-blue border-[1.5px] border-brand-blue py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 ${isSyncing ? 'opacity-70' : 'active:scale-95 transition'}`}
              >
                {isSyncing ? 'Syncing...' : '↓ Restore'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-sm mb-1">📁 Local File Backup</h3>
          <p className="text-xs text-gray-500 mb-3">Save a backup file to your device. Recommended weekly.</p>
          <button onClick={handleExport} className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-sm" data-testid="export-btn">
            📦 Export Backup (.json)
          </button>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 font-semibold mb-2">📥 Restore from file</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full bg-brand-blueLight text-brand-blue border-[1.5px] border-brand-blue py-3.5 rounded-xl font-bold text-sm"
              data-testid="import-btn"
            >
              📂 Choose Backup File
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-sm mb-1 text-brand-red">🗑️ Danger Zone</h3>
          <p className="text-xs text-gray-500 mb-3">Permanently delete all parties and entries.</p>
          <button onClick={handleClear} className="w-full bg-brand-redLight text-brand-red border-[1.5px] border-brand-red py-3 rounded-xl font-bold text-sm" data-testid="clear-btn">
            🗑️ Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
