"use client";

'use client';
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
            <button type="button" className="search-tab-hitarea" aria-label="Open create work order form" onClick={() => router.push('/jobs/create')}></button>
            <svg viewBox="0 0 615 233.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" shapeRendering="geometricPrecision">
              <rect x="1.5" y="1.5" width="612" height="230.3" rx="10" ry="10" fill="var(--bg-secondary)" stroke="var(--border-accent)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="search-tab-content">
              <h2 className="wo-title">Create a WO  +</h2>
            </div>
          </div>
            <div className="sub-search-tab">
              <svg viewBox="0 0 610.99 59.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M0.5 0.5H610.49V49.3A9.5 9.5 0 0 1 600.99 58.8H10A9.5 9.5 0 0 1 0.5 49.3V0.5Z" fill="#2A2B39" stroke="#6C72C9" strokeWidth="1" vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision" />
              </svg>
              <div className="sub-search-content">
              <button type="button" className="sub-action action-left" aria-label="Open policy overlay" onClick={() => setShowPolicyModal(true)}>
                <svg width="20" height="20" viewBox="20 228 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M28 239.5C28.5523 239.5 29 239.052 29 238.5C29 237.948 28.5523 237.5 28 237.5C27.4477 237.5 27 237.948 27 238.5C27 239.052 27.4477 239.5 28 239.5Z" fill="currentColor"/>
                  <path d="M30 238.5C30 237.948 30.4477 237.5 31 237.5H34C34.5523 237.5 35 237.948 35 238.5C35 239.052 34.5523 239.5 34 239.5H31C30.4477 239.5 30 239.052 30 238.5Z" fill="currentColor"/>
                  <path d="M31 240.5C30.4477 240.5 30 240.948 30 241.5C30 242.052 30.4477 242.5 31 242.5H34C34.5523 242.5 35 242.052 35 241.5C35 240.948 34.5523 240.5 34 240.5H31Z" fill="currentColor"/>
                  <path d="M31 243.5C30.4477 243.5 30 243.948 30 244.5C30 245.052 30.4477 245.5 31 245.5H34C34.5523 245.5 35 245.052 35 244.5C35 243.948 34.5523 243.5 34 243.5H31Z" fill="currentColor"/>
                  <path d="M29 241.5C29 242.052 28.5523 242.5 28 242.5C27.4477 242.5 27 242.052 27 241.5C27 240.948 27.4477 240.5 28 240.5C28.5523 240.5 29 240.948 29 241.5Z" fill="currentColor"/>
                  <path d="M28 245.5C28.5523 245.5 29 245.052 29 244.5C29 243.948 28.5523 243.5 28 243.5C27.4477 243.5 27 243.948 27 244.5C27 245.052 27.4477 245.5 28 245.5Z" fill="currentColor"/>
                  <path d="M28 230C27.4477 230 27 230.448 27 231H25C23.8954 231 23 231.895 23 233V248C23 249.105 23.8954 250 25 250H37C38.1046 250 39 249.105 39 248V233C39 231.895 38.1046 231 37 231H35C35 230.448 34.5523 230 34 230H28ZM35 233H37V248H25V233H27V234C27 234.552 27.4477 235 28 235H34C34.5523 235 35 234.552 35 234V233ZM29 233V232H33V233H29Z" fill="currentColor"/>
                </svg>
              </button>
              <button type="button" className="sub-action action-right" aria-label="Open create work order" onClick={() => router.push('/jobs/create')}>
                <span className="sub-action-logo" aria-hidden="true"></span>
              </button>
            </div>
            </div>
          </div>
        </section>
      </div>
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
    </main>
  );
}
