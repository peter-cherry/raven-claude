"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface CandidateRow { id: string; distance_m: number | null; duration_sec: number | null; technicians: { id: string; full_name: string | null; average_rating: number | null; } | null; }

export default function SearchUnfoldingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const jobId = params.get('job_id') || '';
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const { data } = await supabase
        .from('job_candidates')
        .select('*, technicians(*)')
        .eq('job_id', jobId)
        .order('distance_m', { ascending: true });
      if (!mounted) return;
      setCandidates((data as CandidateRow[]) ?? []);
      setLoading(false);
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => { mounted = false; clearInterval(id); };
  }, [jobId]);

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 className="header-title">Finding matches...</h1>
        <p className="header-subtitle">We are looking for nearby compliant technicians.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {loading && <div className="container-card">Loading...</div>}
          {candidates.map((c) => (
            <div key={c.id} className="container-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 300ms ease' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.technicians?.full_name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {c.distance_m != null ? `${(c.distance_m/1609.34).toFixed(1)} mi` : ''}
                  {c.duration_sec != null ? ` • ${(c.duration_sec/60).toFixed(0)} min` : ''}
                </div>
              </div>
              <button className="primary-button" onClick={() => router.push(`/jobs/${jobId}`)}>See details</button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none; } }`}</style>
    </main>
  );
}
