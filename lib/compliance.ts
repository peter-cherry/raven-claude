import { supabase } from '@/lib/supabaseClient';

import { supabase } from '@/lib/supabaseClient';

export type PolicyItemInput = {
  requirement_type: 'COI_VALID' | 'LICENSE_STATE' | string;
  required: boolean;
  weight: number;
  min_valid_days?: number;
};

export async function ensureRequirement(orgId: string, requirement_type: string, weight = 0, min_valid_days = 0) {
  const { data, error } = await supabase
    .from('compliance_requirements')
    .upsert({ org_id: orgId, requirement_type, weight, min_valid_days, enforcement: 'ENABLED' }, { onConflict: 'org_id,requirement_type' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function createDraftPolicy(orgId: string, items: PolicyItemInput[]) {
  // create policy
  const { data: policy, error: pErr } = await supabase
    .from('compliance_policies')
    .insert({ org_id: orgId, status: 'draft' })
    .select('id')
    .single();
  if (pErr) throw pErr;

  // ensure requirements and create items
  for (const it of items) {
    const req = await ensureRequirement(orgId, it.requirement_type, it.weight, it.min_valid_days ?? 0);
    const { error: iErr } = await supabase
      .from('compliance_policy_items')
      .insert({
        policy_id: policy.id,
        requirement_id: req.id,
        required: it.required,
        min_valid_days: it.min_valid_days ?? 0,
        weight: it.weight,
      });
    if (iErr) throw iErr;
  }
  return policy.id as string;
}

export async function getPolicyScores(policyId: string) {
  const { data, error } = await supabase.rpc('technician_meets_policy', { p_policy_id: policyId });
  if (error) throw error;
  return data as { technician_id: string; meets_all: boolean; score: number; failed_requirements: any }[];
}

export async function attachPolicyToJob(policyId: string, jobId: string) {
  const { error } = await supabase.from('compliance_policies').update({ job_id: jobId }).eq('id', policyId);
  if (error) throw error;
}
