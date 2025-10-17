"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
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
  const [job, setJob] = useState<{ address_text: string | null; city: string | null; state: string | null; lat: number | null; lng: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReasonsId, setSelectedReasonsId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<ReasonDetail[]>([]);

  // Preview card that slides in and reports pixel metrics
  const [showPreviewCard, setShowPreviewCard] = useState(true);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [previewMetrics, setPreviewMetrics] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [cardSettled, setCardSettled] = useState(false);
  const [animKey, setAnimKey] = useState(0);

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
    // measure preview card after it animates in
    if (showPreviewCard) {
      const timer = setTimeout(() => {
        const r = previewRef.current?.getBoundingClientRect();
        if (r) setPreviewMetrics({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
      }, 420);
      const settleTimer = setTimeout(() => setCardSettled(true), 820);
      return () => { clearTimeout(timer); clearTimeout(settleTimer); };
    } else {
      setCardSettled(false);
    }
  }, [showPreviewCard]);

  // Load job for map/address
  useEffect(() => {
    if (!jobId) return;
    supabase
      .from('jobs')
      .select('address_text, city, state, lat, lng')
      .eq('id', jobId)
      .single()
      .then(({ data }) => setJob(data as any));
  }, [jobId]);

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
        <h1 className="header-title" style={{ display: 'none' }}>Finding matches...</h1>
        <p className="header-subtitle" style={{ display: 'none' }}>We are looking for nearby compliant technicians.</p>

        {/* Slide-in centered preview card */}
        {showPreviewCard && (
          <div ref={previewRef} className="slide-in-center-card">
            <div className="slide-in-center-inner" style={{ width: '100%', padding: 0, display: 'grid', gap: 0 }}>
              {/* Google Static Maps preview */}
              <div className="map-preview" onClick={() => { setAnimKey((k) => k + 1); setCardSettled(false); setTimeout(() => setCardSettled(true), 50); }}>
                {job?.lat != null && job?.lng != null ? (
                  <img
                    alt="Work order location"
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${job.lat},${job.lng}&zoom=15&size=640x240&scale=2&maptype=roadmap&style=element:geometry|color:0x1D1D20&style=feature:water|element:geometry|color:0x0E0E12&style=feature:road|element:geometry|color:0x2A2931&style=feature:poi|element:geometry|color:0x1D1D20&style=feature:all|element:labels.text.fill|color:0xA0A0A8&style=feature:all|element:labels.text.stroke|color:0x1D1D20&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                  />
                ) : (
                  <div className="map-fallback">Map preview</div>
                )}
                {/* Address overlay inside map, bottom-right with 5px offset */}
                <div className="wo-address-line">
                  <span className="addr-text">{job?.address_text || 'Address not available'}</span>
                  {job?.city || job?.state ? (
                    <span className="addr-city">{[job?.city, job?.state].filter(Boolean).join(', ')}</span>
                  ) : null}
                </div>
              </div>

              {/* Heading below map, 10px offset */}
              <h1 className="header-title" style={{ margin: '10px 20px 0' }}>Finding matches...</h1>
              <p className="header-subtitle" style={{ margin: '-10px 20px 0' }}>We are looking for nearby compliant technicians.</p>

              {/* Strips appear from behind mask 52px below map */}
              <div className="reveal-stage">
                <div className="reveal-mask" aria-hidden="true"></div>
                <div className="tech-strip-list" key={animKey}>
                  {cardSettled && candidates.slice(0, 5).map((c) => {
                    const tech = c.technicians;
                    const coiColor = ((): string => {
                      switch (tech?.coi_state) {
                        case 'valid': return '#10b981';
                        case 'expired': return '#ef4444';
                        case 'uploaded': return '#f59e0b';
                        default: return '#6b7280';
                      }
                    })();
                    const licColor = ((): string => {
                      switch (tech?.verification_status) {
                        case 'verified': return '#10b981';
                        case 'pending': return '#f59e0b';
                        case 'expired': return '#ef4444';
                        default: return '#6b7280';
                      }
                    })();

                    return (
                      <div key={c.id} className="tech-strip">
                        <div className="tech-ident">
                          <div className="tech-name">{tech?.full_name}</div>
                          <div className="tech-distance">
                            {c.distance_m != null ? `${(c.distance_m / 1000).toFixed(0)}Km Away` : ''}
                            {c.duration_sec != null ? '' : ''}
                          </div>
                        </div>

                        <div className="tech-lights">
                          <span className="light-dot" style={{ backgroundColor: coiColor }} />
                          <span className="light-dot" style={{ backgroundColor: licColor }} />
                        </div>

                        <div className="tech-rating">{(tech?.average_rating ?? 0).toFixed(1)}</div>

                        <button className="tech-reasons" onClick={() => handleShowReasons(c)}>See reasons →</button>

                        <button className="primary-button tech-assign" onClick={() => router.push(`/jobs/${jobId}`)}>Assign</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {previewMetrics && (
                <div className="slide-in-metrics">x: {previewMetrics.x}px, y: {previewMetrics.y}px, w: {previewMetrics.w}px, h: {previewMetrics.h}px</div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          {loading && (
            <div className="container-card" style={{ padding: 20, textAlign: 'center' }}>
              Loading...
            </div>
          )}

          {false && candidates.map((c) => {
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
