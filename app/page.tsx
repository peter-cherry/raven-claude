"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PolicyModal } from '@/components/PolicyModal';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const [q, setQ] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmitWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!q.trim()) {
      setError('Please enter a work order');
      return;
    }

    if (!user) {
      setError('Please log in to submit work orders');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/work-orders/raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: q,
          source: 'search_input',
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMsg = 'Failed to submit work order';

        if (contentType?.includes('application/json')) {
          try {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
          } catch {
            errorMsg = `Server error (${response.status})`;
          }
        } else {
          errorMsg = `Server error (${response.status})`;
        }

        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      // Clear input and show success
      setQ('');
      setSuccess(true);
      setError(null);
      console.log('Work order submitted successfully:', data);

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

      // Optionally redirect to jobs list or parsing queue
      // router.push('/work-orders/pending');
    } catch (err) {
      console.error('Form error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="content-area">
      <div className="content-inner center-viewport">
        <section className="home-hero">
          <div className="wo-panel">
            <h2 className="wo-title">Create a WO  +</h2>
            <form className="wo-search" role="search" onSubmit={handleSubmitWorkOrder}>
              <button
                className="wo-icon-btn"
                aria-label="New work order"
                type="button"
                onClick={() => setShowPolicyModal(true)}
                disabled={isSubmitting}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13 2v5h5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              <input
                className="wo-input"
                placeholder="Paste work order from email..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setError(null);
                }}
                disabled={isSubmitting}
              />
              <button
                className="wo-search-btn"
                aria-label="Submit work order"
                type="submit"
                disabled={isSubmitting}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </form>
            {error && <p className="wo-error">{error}</p>}
            {success && <p style={{ color: 'var(--success, #10B981)', fontSize: 14, marginTop: 8, marginBottom: 0 }}>✓ Work order submitted successfully!</p>}
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
