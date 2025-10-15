"use client";

import { useState } from 'react';

const policies = [
  { id: 1, name: 'GL', currency: 'USD', amount: '6,000,000', checked: true },
  { id: 2, name: 'AUTO', currency: 'USD', amount: '2,000,000', checked: false },
  { id: 3, name: 'WCRL', currency: 'USD', amount: '6,000,000', checked: false },
  { id: 4, name: 'CPL', currency: 'USD', amount: '1,500,000', checked: false },
  { id: 5, name: 'GL', currency: 'USD', amount: '7,000,000', checked: false },
  { id: 6, name: 'Endorsements', currency: 'USD', amount: '5,000,00', checked: false },
  { id: 7, name: 'Expiry', currency: 'USD', amount: '6,000,00', checked: false },
];

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyModal({ isOpen, onClose }: PolicyModalProps) {
  const [selected, setSelected] = useState<number[]>([1]);

  if (!isOpen) return null;

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="policy-list">
          {policies.map((policy) => (
            <div key={policy.id} className="policy-row">
              <input
                type="checkbox"
                checked={selected.includes(policy.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected([...selected, policy.id]);
                  } else {
                    setSelected(selected.filter((id) => id !== policy.id));
                  }
                }}
                className="policy-checkbox"
              />
              <span className="policy-name">{policy.name}</span>
              <span className="policy-currency">{policy.currency}</span>
              <span className="policy-divider">-</span>
              <span className="policy-amount">{policy.amount}</span>
              <button className="policy-menu-btn" aria-label="Options">
                <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                  <circle cx="2" cy="2" r="2" fill="currentColor"/>
                  <circle cx="2" cy="8" r="2" fill="currentColor"/>
                  <circle cx="2" cy="14" r="2" fill="currentColor"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="policy-footer">
          <span className="policy-footer-text">Insert details wherever they reside on this page</span>
        </div>
      </div>
    </div>
  );
}
