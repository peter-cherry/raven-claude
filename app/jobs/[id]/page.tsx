"use client";

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { attachPolicyToJob, getPolicyScores } from '@/lib/compliance';

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
  const [scores, setScores] = useState<any[] | null>(null);
  const [techMap, setTechMap] = useState<Record<string, { id: string; full_name: string | null; city: string | null; state: string | null }>>({});
  const [reasonsFor, setReasonsFor] = useState<any | null>(null);
  const pathname = usePathname();
  const params = useSearchParams();
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

  useEffect(() => {
    const policyId = params.get('policy_id');
    if (!policyId || !jobId) return;
    (async () => {
      try {
        await attachPolicyToJob(policyId, jobId);
        const d = await getPolicyScores(policyId);
        const sorted = (d ?? []).sort((a: any, b: any) => b.score - a.score);
        setScores(sorted);
        const topIds = sorted.slice(0, 5).map((x: any) => x.technician_id);
        if (topIds.length) {
          const { data } = await supabase.from('technicians').select('id, full_name, city, state').in('id', topIds);
          const map: Record<string, any> = {};
          (data ?? []).forEach((t: any) => { map[t.id] = t; });
          setTechMap(map);
        }
      } catch {}
    })();
  }, [params, jobId]);

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

        {scores && (
          <div className="container-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Top matches for policy</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {scores.slice(0,5).map((s: any, idx: number) => {
                const t = techMap[s.technician_id];
                const passed = (type: string) => (s.passed_requirements ?? []).some((r: any) => (r.type ?? r.type)?.toString() === type || (r.type ?? r.type) === type);
                const coiPass = passed('COI_VALID');
                const licPass = passed('LICENSE_STATE');
                const cand = (candidates || []).find((c) => c.technicians?.id === s.technician_id);
                const dist = cand?.distance_m != null ? `${(cand.distance_m/1000).toFixed(0)}Km Away` : '';
                return (
                  <div key={s.technician_id} className="container-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ width: 18, textAlign: 'right', fontWeight: 700 }}>{idx+1}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t?.full_name ?? s.technician_id.slice(0,8)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{dist}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`mini-dot ${coiPass ? 'dot-green' : 'dot-amber'}`} title="COI valid" />
                      <span className={`mini-dot ${licPass ? 'dot-green' : 'dot-amber'}`} title="License by state" />
                      <span className={`score-badge ${s.score >= 80 ? 'high' : s.score >= 60 ? 'medium' : 'low'}`}>{s.score}</span>
                      <button className="outline-button" onClick={() => setReasonsFor(s)}>See Reasons</button>
                      <button className="primary-button" onClick={() => assign(s.technician_id)}>Assign</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
