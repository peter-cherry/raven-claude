"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface CandidateRow {
  id: string;
  distance_m: number | null;
  duration_sec: number | null;
  technicians: {
    id: string;
    full_name: string | null;
    average_rating: number | null;
  } | null;
}

interface JobRow {
  id: string;
  job_title: string;
  description: string | null;
  city: string | null;
  state: string | null;
  trade_needed: string | null;
  address_text: string | null;
  scheduled_at: string | null;
}

export default function JobDetailPage() {
  const [job, setJob] = useState<JobRow | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const pathname = usePathname();
  const jobId = pathname?.split('/').pop() || '';

  useEffect(() => {
    supabase
      .from('jobs')
      .select('*, job_candidates(*, technicians(*))')
      .eq('id', jobId)
      .single()
      .then(({ data }) => {
        if (data) {
          setJob(data as any);
          setCandidates((data as any).job_candidates ?? []);
        }
      });
  }, [jobId]);

  const assign = async (techId: string) => {
    await supabase.from('job_assignments').insert({ job_id: jobId, technician_id: techId, status: 'proposed' });
    await supabase.from('jobs').update({ job_status: 'assigned', assigned_technician_id: techId }).eq('id', jobId);
    alert('Technician proposed for assignment');
  };

  if (!job) return (
    <main className="content-area"><div className="content-inner"><p className="header-subtitle">Loading...</p></div></main>
  );

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 className="header-title">{job.job_title}</h1>
        <p className="header-subtitle">{job.trade_needed} • {job.city} {job.state}</p>

        <div className="container-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div>{job.description}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{job.address_text}</div>
            {job.scheduled_at && <div>Scheduled: {new Date(job.scheduled_at).toLocaleString()}</div>}
          </div>
        </div>

        <h2 className="header-title" style={{ fontSize: 20 }}>Matched technicians</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {candidates.map((c) => (
            <div key={c.id} className="container-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.technicians?.full_name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {c.distance_m != null ? `${(c.distance_m/1609.34).toFixed(1)} mi` : ''}
                  {c.duration_sec != null ? ` • ${(c.duration_sec/60).toFixed(0)} min` : ''}
                </div>
              </div>
              <button className="primary-button" onClick={() => assign(c.technicians?.id || '')}>Assign</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
