"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface TechRow { id: string; full_name: string | null; trade_needed: string | null; average_rating: number | null; coi_state: string | null; city: string | null; state: string | null; }

export default function TechniciansPage() {
  const [q, setQ] = useState('');
  const [techs, setTechs] = useState<TechRow[]>([]);

  useEffect(() => {
    supabase
      .from('technicians')
      .select('*')
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .then(({ data }) => setTechs((data as TechRow[]) ?? []));
  }, []);

  const filtered = techs.filter((t) => (t.full_name || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="content-area">
      <div className="content-inner" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 className="header-title">Technicians</h1>
        <div className="search-wrapper" style={{ marginBottom: 16 }}>
          <input className="search-input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((t) => (
            <Link key={t.id} href={`/technicians/${t.id}`} className="container-card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.full_name}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{t.trade_needed} • {t.city ?? ''} {t.state ?? ''}</div>
                </div>
                <span className="score-badge high">{t.average_rating?.toFixed(1) ?? '—'}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
