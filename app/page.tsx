"use client";

import Link from 'next/link';
import { useState } from 'react';
import { PolicyModal } from '@/components/PolicyModal';

export default function HomePage() {
  const [q, setQ] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  return (
    <main className="content-area">
      <div className="content-inner center-viewport">
        <section className="home-hero">
          <div className="wo-panel">
            <h2 className="wo-title">Create a WO  +</h2>
            <div className="wo-search" role="search">
              <button className="wo-icon-btn" aria-label="New work order" type="button" onClick={() => setShowPolicyModal(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13 2v5h5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              <input className="wo-input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="wo-search-btn" aria-label="Search" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="home-cta">
            <Link className="primary-button gradient-cta" href="/jobs/create">Create Work Order</Link>
          </div>
        </section>
      </div>
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
    </main>
  );
}
