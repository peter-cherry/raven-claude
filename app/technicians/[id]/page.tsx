"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function TechnicianProfilePage() {
  const pathname = usePathname();
  const techId = pathname?.split('/').pop() || '';
  const [tech, setTech] = useState<any>(null);

  useEffect(() => {
    supabase
      .from('technicians')
      .select('*, technician_licenses(*), job_assignments(*, jobs(*))')
      .eq('id', techId)
      .single()
      .then(({ data }) => setTech(data));
  }, [techId]);

  if (!tech) return (<main className="content-area"><div className="content-inner"><p className="header-subtitle">Loading...</p></div></main>);

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 className="header-title">{tech.full_name}</h1>
        <p className="header-subtitle">{tech.trade_needed} • {tech.city} {tech.state}</p>
        <div className="container-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div>Phone: {tech.phone}</div>
            <div>Email: {tech.email}</div>
            <div>Service radius: {tech.service_area_radius} miles</div>
          </div>
        </div>
        <h2 className="header-title" style={{ fontSize: 20 }}>Licenses</h2>
        <div className="container-card" style={{ marginBottom: 16 }}>
          {(tech.technician_licenses ?? []).map((l: any) => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', padding: '8px 0' }}>
              <span>{l.license_type} {l.license_number}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{l.license_state}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
