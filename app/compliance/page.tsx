"use client";

import { useState } from 'react';

const mockData = [
  { id: 1, name: 'Armando Diego Maradona', state: 'CA', compliance: 'Full', city: 'Los Angeles', score: 7.5, status: 'active' },
  { id: 2, name: 'Georges Dantbes', state: 'NY', compliance: 'Partial', city: 'New York', score: 6.5, status: 'active' },
  { id: 3, name: 'Georges Daaboul', state: 'TX', compliance: 'Full', city: 'Houston', score: 7.5, status: 'active' },
  { id: 4, name: 'Charlie Sheen', state: 'CA', compliance: 'None', city: 'San Diego', score: 5.3, status: 'inactive' },
  { id: 5, name: 'Curtis Jackson', state: 'NY', compliance: 'Full', city: 'Buffalo', score: 7.5, status: 'active' },
];

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getScoreClass = (score: number) => {
    if (score >= 7) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  };

  return (
    <main className="content-area">
      <div className="content-inner">
        <div className="compliance-container">
          <div className="compliance-header">
            <h1 className="header-title no-margin">Compliance & Policies</h1>
          </div>
          <p className="header-subtitle">Monitor technician compliance status</p>

          <section id="frame-6" className="section-spacer" />

          <div className="search-wrapper search-spacer">
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
                    <div className="tech-cell">
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
                    <button className="outline-button outline-small">
                      See Reasons
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
