"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import { getPolicyScores } from '@/lib/compliance';

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
  const [scores, setScores] = useState<any[] | null>(null);
  const [techMap, setTechMap] = useState<Record<string, { id: string; full_name: string | null; city: string | null; state: string | null }>>({});
  const [reasonsFor, setReasonsFor] = useState<any | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setJobs((data as JobRow[]) ?? []));
  }, []);

  useEffect(() => {
    const policyId = params.get('policy_id');
    if (!policyId) return;
    getPolicyScores(policyId)
      .then(async (d) => {
        const sorted = (d ?? []).sort((a: any, b: any) => b.score - a.score);
        setScores(sorted);
        const topIds = sorted.slice(0, 5).map((x: any) => x.technician_id);
        if (topIds.length) {
          const { data } = await supabase.from('technicians').select('id, full_name, city, state').in('id', topIds);
          const map: Record<string, any> = {};
          (data ?? []).forEach((t: any) => { map[t.id] = t; });
          setTechMap(map);
        }
      })
      .catch(() => setScores([]));
  }, [params]);

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 className="header-title">Jobs</h1>
        <p className="header-subtitle">Recent work orders</p>
        {scores && (
          <div className="container-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Policy match scores</div>
                <div style={{ color: 'var(--text-secondary)' }}>{scores.length} technicians evaluated</div>
              </div>
              <Link href={`/jobs/create?policy_id=${params.get('policy_id')}`} className="outline-button">Continue with policy</Link>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {scores.slice(0, 5).map((s: any, idx: number) => {
                const t = techMap[s.technician_id];
                return (
                  <div key={s.technician_id} className="container-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, width: 20, textAlign: 'right' }}>{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t?.full_name ?? s.technician_id.slice(0, 8)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t?.city ?? ''} {t?.state ?? ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`mini-dot ${(s.passed_requirements ?? []).some((r:any)=>r.type==='COI_VALID') ? 'dot-green':'dot-amber'}`} title="COI" />
                      <span className={`mini-dot ${(s.passed_requirements ?? []).some((r:any)=>r.type==='LICENSE_STATE') ? 'dot-green':'dot-amber'}`} title="License" />
                      <span className={`score-badge ${s.score >= 80 ? 'high' : s.score >= 60 ? 'medium' : 'low'}`}>{s.score}</span>
                      <button className="outline-button" onClick={() => setReasonsFor(s)}>See Reasons</button>
                      <Link href={`/technicians/${s.technician_id}`} className="outline-button">View</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
        {reasonsFor && (
          <div className="policy-modal-overlay" onClick={() => setReasonsFor(null)}>
            <div className="policy-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="policy-list">
                <div className="header-title" style={{ fontSize: 18 }}>Reasons for {techMap[reasonsFor.technician_id]?.full_name ?? reasonsFor.technician_id.slice(0,8)}</div>
                <div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>Passed</div>
                  <ul>
                    {(reasonsFor.passed_requirements ?? []).map((r: any, i: number) => (<li key={i}>{r.type}</li>))}
                  </ul>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>Failed</div>
                  <ul>
                    {(reasonsFor.failed_requirements ?? []).map((r: any, i: number) => (<li key={i}>{r.type}</li>))}
                  </ul>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="outline-button" onClick={() => setReasonsFor(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
