"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface CandidateRow {
  id: string;
  distance_m: number | null;
  duration_sec: number | null;
  technicians: {
    id: string;
    full_name: string | null;
    average_rating: number | null;
    coi_state?: string;
    verification_status?: string;
  } | null;
}

interface ReasonDetail {
  type: 'coi' | 'license';
  status: string;
  message: string;
}

export default function SearchUnfoldingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const jobId = params.get('job_id') || '';
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReasonsId, setSelectedReasonsId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<ReasonDetail[]>([]);

  // Persist current job_id for quick retesting
  useEffect(() => {
    if (jobId) {
      try { localStorage.setItem('last_job_id', jobId); setLastJobId(jobId); } catch {}
    } else {
      try {
        const prev = localStorage.getItem('last_job_id');
        setLastJobId(prev);
        if (prev) router.replace(`/search-unfolding?job_id=${prev}`);
      } catch {}
    }
  }, [jobId, router]);

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

  const getComplianceScore = (tech: CandidateRow['technicians']) => {
    if (!tech) return 0;
    let score = 0;
    if (tech.coi_state === 'valid') score += 40;
    if (tech.verification_status === 'verified') score += 40;
    score += Math.floor(((tech.average_rating || 0) / 5) * 20);
    return Math.min(score, 100);
  };

  const getComplianceLight = (state: string | undefined) => {
    switch (state) {
      case 'valid':
        return { color: '#10b981', tooltip: 'COI Valid' };
      case 'expired':
        return { color: '#ef4444', tooltip: 'COI Expired' };
      case 'uploaded':
        return { color: '#f59e0b', tooltip: 'COI Pending' };
      default:
        return { color: '#6b7280', tooltip: 'No COI' };
    }
  };

  const getLicenseLight = (status: string | undefined) => {
    switch (status) {
      case 'verified':
        return { color: '#10b981', tooltip: 'License Verified' };
      case 'pending':
        return { color: '#f59e0b', tooltip: 'License Pending' };
      case 'expired':
        return { color: '#ef4444', tooltip: 'License Expired' };
      default:
        return { color: '#6b7280', tooltip: 'No License' };
    }
  };

  const handleShowReasons = (candidate: CandidateRow) => {
    const tech = candidate.technicians;
    const details: ReasonDetail[] = [];

    if (tech?.coi_state === 'valid') {
      details.push({
        type: 'coi',
        status: 'Valid',
        message: 'Certificate of Insurance is current and valid',
      });
    } else if (tech?.coi_state === 'expired') {
      details.push({
        type: 'coi',
        status: 'Expired',
        message: 'Certificate of Insurance has expired',
      });
    } else if (tech?.coi_state === 'uploaded') {
      details.push({
        type: 'coi',
        status: 'Pending Review',
        message: 'Certificate of Insurance uploaded, pending verification',
      });
    } else {
      details.push({
        type: 'coi',
        status: 'Missing',
        message: 'No Certificate of Insurance on file',
      });
    }

    if (tech?.verification_status === 'verified') {
      details.push({
        type: 'license',
        status: 'Verified',
        message: 'Trade license verified and active',
      });
    } else if (tech?.verification_status === 'expired') {
      details.push({
        type: 'license',
        status: 'Expired',
        message: 'Trade license has expired',
      });
    } else if (tech?.verification_status === 'pending') {
      details.push({
        type: 'license',
        status: 'Pending',
        message: 'License verification pending',
      });
    } else {
      details.push({
        type: 'license',
        status: 'Unverified',
        message: 'No verified license on file',
      });
    }

    setReasons(details);
    setSelectedReasonsId(candidate.id);
  };

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 className="header-title">Finding matches...</h1>
        <p className="header-subtitle">We are looking for nearby compliant technicians.</p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 12 }}>
          {lastJobId && (
            <button className="outline-button" onClick={() => router.replace(`/search-unfolding?job_id=${lastJobId}`)}>
              Use last job
            </button>
          )}
          <button className="outline-button" onClick={() => { try { navigator.clipboard.writeText(window.location.href); } catch {} }}>Copy link</button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {loading && (
            <div className="container-card" style={{ padding: 20, textAlign: 'center' }}>
              Loading...
            </div>
          )}

          {candidates.map((c) => {
            const complianceScore = getComplianceScore(c.technicians);
            const coiLight = getComplianceLight(c.technicians?.coi_state);
            const licenseLight = getLicenseLight(c.technicians?.verification_status);

            return (
              <div
                key={c.id}
                className="container-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto',
                  gap: 16,
                  alignItems: 'start',
                  padding: 20,
                  animation: 'fadeIn 300ms ease',
                }}
              >
                {/* Status Lights + Score Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  {/* COI Light */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: coiLight.color,
                      cursor: 'pointer',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      title: coiLight.tooltip,
                    }}
                    title={coiLight.tooltip}
                  />

                  {/* License Light */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: licenseLight.color,
                      cursor: 'pointer',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      title: licenseLight.tooltip,
                    }}
                    title={licenseLight.tooltip}
                  />

                  {/* Score Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 4,
                      backgroundColor:
                        complianceScore >= 80
                          ? 'rgba(16, 185, 129, 0.1)'
                          : complianceScore >= 60
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      color:
                        complianceScore >= 80
                          ? '#10b981'
                          : complianceScore >= 60
                          ? '#f59e0b'
                          : '#ef4444',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {complianceScore}%
                  </div>
                </div>

                {/* Technician Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff' }}>
                    {c.technicians?.full_name}
                  </div>

                  <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {c.distance_m != null
                      ? `${(c.distance_m / 1609.34).toFixed(1)} mi`
                      : ''}
                    {c.duration_sec != null
                      ? ` • ${(c.duration_sec / 60).toFixed(0)} min`
                      : ''}
                  </div>

                  {c.technicians?.average_rating && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      ⭐ {c.technicians.average_rating.toFixed(1)} rating
                    </div>
                  )}

                  {/* See Reasons Link */}
                  <button
                    onClick={() => handleShowReasons(c)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8b5cf6',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 14,
                      textDecoration: 'underline',
                      marginTop: 4,
                    }}
                  >
                    See reasons →
                  </button>
                </div>

                {/* Action Button Column */}
                <button
                  className="primary-button"
                  onClick={() => router.push(`/jobs/${jobId}`)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 14,
                  }}
                >
                  Assign
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasons Overlay */}
      {selectedReasonsId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedReasonsId(null)}
        >
          <div
            style={{
              backgroundColor: '#1d1d20',
              borderRadius: 12,
              padding: 32,
              maxWidth: 500,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                {candidates.find((c) => c.id === selectedReasonsId)?.technicians?.full_name}
              </h2>
              <button
                onClick={() => setSelectedReasonsId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#ffffff',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reasons.map((reason, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor:
                        reason.status === 'Valid' || reason.status === 'Verified'
                          ? '#10b981'
                          : reason.status === 'Pending' || reason.status === 'Pending Review'
                          ? '#f59e0b'
                          : '#ef4444',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      {reason.type === 'coi' ? 'Certificate of Insurance' : 'Trade License'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {reason.status}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {reason.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedReasonsId(null)}
              className="primary-button"
              style={{
                width: '100%',
                marginTop: 24,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
