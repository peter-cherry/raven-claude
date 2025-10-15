"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface JobRow {
  id: string;
  job_title: string;
  city: string | null;
  state: string | null;
  trade_needed: string | null;
  job_status: string | null;
  scheduled_at: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setJobs((data as JobRow[]) ?? []));
  }, []);

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 className="header-title">Jobs</h1>
        <p className="header-subtitle">Recent work orders</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="container-card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{j.job_title}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{j.trade_needed} • {j.city ?? ''} {j.state ?? ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="outline-button" style={{ padding: '6px 12px', fontSize: 12 }}>{j.job_status ?? 'pending'}</span>
                  {j.scheduled_at && <span style={{ color: 'var(--text-secondary)' }}>{new Date(j.scheduled_at).toLocaleString()}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
