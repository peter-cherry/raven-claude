"use client";

import { useState } from 'react';
import { PolicyModal } from '@/components/PolicyModal';

const mockData = [
  { id: 1, name: 'Armando Diego Maradona', state: 'CA', compliance: 'Full', city: 'Los Angeles', score: 7.5, status: 'active' },
  { id: 2, name: 'Georges Dantbes', state: 'NY', compliance: 'Partial', city: 'New York', score: 6.5, status: 'active' },
  { id: 3, name: 'Georges Daaboul', state: 'TX', compliance: 'Full', city: 'Houston', score: 7.5, status: 'active' },
  { id: 4, name: 'Charlie Sheen', state: 'CA', compliance: 'None', city: 'San Diego', score: 5.3, status: 'inactive' },
  { id: 5, name: 'Curtis Jackson', state: 'NY', compliance: 'Full', city: 'Buffalo', score: 7.5, status: 'active' },
];


export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const getScoreClass = (score: number) => {
    if (score >= 7) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  };

  return (
    <main className="content-area">
      <div className="content-inner">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <h1 className="header-title" style={{ marginBottom: 0 }}>Compliance & Policies</h1>
            <button onClick={() => setShowPolicyModal(true)} className="wo-icon-btn" aria-label="View policies" style={{ marginTop: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 2v5h5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
          <p className="header-subtitle">Monitor technician compliance status</p>

          <section id="frame-6" style={{ marginBottom: '16px' }} />

          <div className="search-wrapper" style={{ marginBottom: '24px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Trade</th>
                <th>State</th>
                <th>Compliance</th>
                <th>City</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`status-dot ${item.status}`} />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.state}</td>
                  <td>{item.compliance}</td>
                  <td>{item.city}</td>
                  <td>
                    <span className={`score-badge ${getScoreClass(item.score)}`}>
                      {item.score}
                    </span>
                  </td>
                  <td>
                    <button className="outline-button" style={{ fontSize: '12px', padding: '6px 12px' }}>
                      See Reasons
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
    </main>
  );
}
