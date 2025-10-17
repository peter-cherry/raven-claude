"use client";

import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 className="header-title">Settings</h1>
        <div className="container-card">
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>User ID:</strong> {user?.id ?? '—'}</div>
            <div><strong>Email:</strong> {user?.email ?? '—'}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
