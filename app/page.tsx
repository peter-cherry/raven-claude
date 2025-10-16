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

      // Now trigger parsing and job creation
      console.log('Parsing work order...');
      const processResponse = await fetch('/api/work-orders/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_work_order_id: data.raw_work_order_id,
        }),
      });

      if (!processResponse.ok) {
        const processError = await processResponse.json();
        console.error('Processing error:', processError);
        // Still show success but log the error
        setTimeout(() => {
          router.push('/work-orders');
        }, 2000);
        return;
      }

      const processData = await processResponse.json();
      console.log('Processing complete:', processData);

      // Redirect to search-unfolding with job ID to show matching technicians
      setTimeout(() => {
        router.push(`/search-unfolding?job_id=${processData.job_id}`);
      }, 2000);
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
          <div className="search-tab-group">
            <div className="search-tab">
            <Link href="/jobs/create" className="search-tab-hitarea" aria-label="Open create work order form"></Link>
            <svg viewBox="0 0 615 174" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <rect x="0" y="0" width="615" height="174" rx="10" ry="10" fill="var(--bg-secondary)" stroke="var(--border-accent)" strokeWidth="2" />
            </svg>
            <div className="search-tab-content">
              <h2 className="wo-title">Create a WO  +</h2>
            </div>
          </div>
            <div className="sub-search-tab">
              <svg viewBox="0 0 610.99 59.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M0 0H610.99V49.3A10 10 0 0 1 600.99 59.3H10A10 10 0 0 1 0 49.3V0Z" fill="#2A2B39" stroke="var(--border-accent)" strokeWidth="2" />
              </svg>
              <div className="sub-search-content"></div>
            </div>
          </div>
        </section>
      </div>
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
    </main>
  );
}
