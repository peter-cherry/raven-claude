"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { getPolicyScores } from '@/lib/compliance';

const phoneRegex = /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4})$/;

const FormSchema = z.object({
  job_title: z.string().min(1).max(200),
  description: z.string().optional(),
  trade_needed: z.enum(['HVAC','Plumbing','Electrical','Handyman','Facilities Tech','Other']),
  required_certifications: z.array(z.string()).optional().default([]),
  address_text: z.string().min(1),
  scheduled_start_ts: z.string().min(1),
  duration: z.string().optional(),
  urgency: z.enum(['emergency','same_day','next_day','within_week','flexible']),
  budget_min: z.coerce.number().optional(),
  budget_max: z.coerce.number().optional(),
  pay_rate: z.string().optional(),
  contact_name: z.string().min(1),
  contact_phone: z.string().regex(phoneRegex, 'Phone must be (555) 123-4567 or 555-123-4567'),
  contact_email: z.string().email(),
});

type FormData = z.infer<typeof FormSchema>;

async function geocodeAddress(query: string) {
  const token = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!token) {
    console.error('Google Maps API key not configured');
    return { success: false } as const;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${token}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('Google Maps geocoding error:', data.status, data.error_message);
      return { success: false } as const;
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components;

      const city = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name ?? null;
      const state = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name ?? null;

      return {
        success: true,
        lat: location.lat,
        lng: location.lng,
        city,
        state,
      } as const;
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
  }

  return { success: false } as const;
}


export default function CreateJobPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState<any[] | null>(null);
  const [techMap, setTechMap] = useState<Record<string, { id: string; full_name: string | null; city: string | null; state: string | null }>>({});
  const [reasonsFor, setReasonsFor] = useState<any | null>(null);

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
      <div className="content-inner center-viewport">
        {scores && (
          <div className="container-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Top matches for policy (preview)</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {scores.slice(0,5).map((s: any, idx: number) => {
                const t = techMap[s.technician_id];
                return (
                  <div key={s.technician_id} className="container-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 18, textAlign: 'right', fontWeight: 700 }}>{idx+1}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t?.full_name ?? s.technician_id.slice(0,8)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t?.city ?? ''} {t?.state ?? ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`mini-dot ${(s.passed_requirements ?? []).some((r:any)=>r.type==='COI_VALID') ? 'dot-green':'dot-amber'}`} title="COI" />
                      <span className={`mini-dot ${(s.passed_requirements ?? []).some((r:any)=>r.type==='LICENSE_STATE') ? 'dot-green':'dot-amber'}`} title="License" />
                      <span className={`score-badge ${s.score >= 80 ? 'high' : s.score >= 60 ? 'medium' : 'low'}`}>{s.score}</span>
                      <button className="outline-button" onClick={() => setReasonsFor(s)}>See Reasons</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
        <form className="container-card form-grid" onSubmit={async (e) => {
          e.preventDefault();
          setErrors({});
          setSubmitting(true);
          const fd = new globalThis.FormData(e.currentTarget as HTMLFormElement);
          const payload: Partial<FormData> = {
            job_title: String(fd.get('job_title') || ''),
            description: String(fd.get('description') || ''),
            trade_needed: String(fd.get('trade_needed') || 'HVAC') as any,
            address_text: String(fd.get('address_text') || ''),
            scheduled_start_ts: String(fd.get('scheduled_start_ts') || ''),
            duration: String(fd.get('duration') || ''),
            urgency: String(fd.get('urgency') || 'within_week') as any,
            budget_min: fd.get('budget_min') ? Number(fd.get('budget_min')) : undefined,
            budget_max: fd.get('budget_max') ? Number(fd.get('budget_max')) : undefined,
            pay_rate: String(fd.get('pay_rate') || ''),
            contact_name: String(fd.get('contact_name') || ''),
            contact_phone: String(fd.get('contact_phone') || ''),
            contact_email: String(fd.get('contact_email') || ''),
          };
          const parsed = FormSchema.safeParse(payload);
          if (!parsed.success) {
            const errs: Record<string, string> = {};
            for (const issue of parsed.error.issues) errs[issue.path.join('.')] = issue.message;
            setErrors(errs);
            setSubmitting(false);
            return;
          }

          const geo = await geocodeAddress(parsed.data.address_text);
          if (!geo.success) {
            setErrors({ address_text: 'Unable to find address' });
            setSubmitting(false);
            return;
          }

          // Get user's organization
          let orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID;
          if (user) {
            const { data: membership } = await supabase
              .from('org_memberships')
              .select('org_id')
              .eq('user_id', user.id)
              .single();
            if (membership?.org_id) {
              orgId = membership.org_id;
            }
          }

          const { data: job, error } = await supabase
            .from('jobs')
            .insert({
              org_id: orgId,
              job_title: parsed.data.job_title,
              description: parsed.data.description,
              trade_needed: parsed.data.trade_needed,
              required_certifications: parsed.data.required_certifications ?? [],
              address_text: parsed.data.address_text,
              city: geo.city,
              state: geo.state,
              lat: geo.lat,
              lng: geo.lng,
              scheduled_at: parsed.data.scheduled_start_ts,
              duration: parsed.data.duration,
              urgency: parsed.data.urgency,
              budget_min: parsed.data.budget_min,
              budget_max: parsed.data.budget_max,
              pay_rate: parsed.data.pay_rate,
              contact_name: parsed.data.contact_name,
              contact_phone: parsed.data.contact_phone,
              contact_email: parsed.data.contact_email,
              job_status: 'matching',
            })
            .select()
            .single();

          if (error || !job) {
            setErrors({ form: error?.message || 'Failed to create job' });
            setSubmitting(false);
            return;
          }

          await supabase.rpc('find_matching_technicians', {
            p_job_id: job.id,
            p_lat: geo.lat,
            p_lng: geo.lng,
            p_trade: parsed.data.trade_needed,
            p_state: geo.state,
            p_max_distance_m: 40000,
          });

          router.push(`/search-unfolding?job_id=${job.id}`);
        }} aria-label="Work order form">
          <h1 className="header-title">Create work order</h1>
          <p className="header-subtitle">Provide job details for technician assignment</p>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="job_title">Work order title</label>
              <input className="text-input" id="job_title" name="job_title" />
              {errors.job_title && <span style={{ color: 'var(--error)' }}>{errors.job_title}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea className="textarea-input" id="description" name="description" />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="trade_needed">Trade needed</label>
              <select className="select-input" id="trade_needed" name="trade_needed" defaultValue="HVAC">
                <option>HVAC</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Handyman</option>
                <option>Facilities Tech</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="address_text">Address</label>
              <input className="text-input" id="address_text" name="address_text" />
              {errors.address_text && <span style={{ color: 'var(--error)' }}>{errors.address_text}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="scheduled_start_ts">Scheduled start</label>
              <input className="text-input" type="datetime-local" id="scheduled_start_ts" name="scheduled_start_ts" />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="urgency">Urgency</label>
              <select className="select-input" id="urgency" name="urgency" defaultValue="within_week">
                <option value="emergency">Emergency</option>
                <option value="same_day">Same day</option>
                <option value="next_day">Next day</option>
                <option value="within_week">Within a week</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="duration">Duration</label>
              <input className="text-input" id="duration" name="duration" placeholder="e.g., 2-3 hours" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field">
                <label className="form-label" htmlFor="budget_min">Budget min</label>
                <input className="text-input" id="budget_min" name="budget_min" type="number" />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="budget_max">Budget max</label>
                <input className="text-input" id="budget_max" name="budget_max" type="number" />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="pay_rate">Pay rate</label>
              <input className="text-input" id="pay_rate" name="pay_rate" placeholder="$75/hr" />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_name">Contact name</label>
              <input className="text-input" id="contact_name" name="contact_name" />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_phone">Contact phone</label>
              <input className="text-input" id="contact_phone" name="contact_phone" placeholder="(555) 123-4567" />
              {errors.contact_phone && <span style={{ color: 'var(--error)' }}>{errors.contact_phone}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_email">Contact email</label>
              <input className="text-input" id="contact_email" name="contact_email" type="email" />
            </div>

            {errors.form && <div style={{ color: 'var(--error)' }}>{errors.form}</div>}
            <button className="primary-button" disabled={submitting} type="submit" style={{ background: 'linear-gradient(90deg, #6C72C9, #8083AE)' }}>Create Work Order</button>
          </div>
        </form>
      </div>
    </main>
  );
}
